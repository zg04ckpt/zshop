using API.Middlewares;
using Core.Configurations;
using Core.DTOs.Common;
using Core.Interfaces.Repositories;
using Core.Interfaces.Services;
using Core.Interfaces.Services.External;
using Core.Repositories.Impl;
using Core.Services;
using Core.Services.External;
using Core.Utilities;
using Data;
using Data.Repositories;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Serilog.Events;
using StackExchange.Redis;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;

builder.Services.AddHttpContextAccessor();

// Add config mapping
builder.Services.Configure<JwtConfig>(config.GetSection("JwtConfig"));
builder.Services.Configure<AuthConfig>(config.GetSection("AuthConfig"));
builder.Services.Configure<MailConfig>(config.GetSection("MailConfig"));
builder.Services.Configure<VNPayConfig>(config.GetSection("VNPayConfig"));
builder.Services.Configure<PaymentConfig>(config.GetSection("PaymentConfig"));

// Add sqlserver service to the container.
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(config.GetConnectionString("SqlServer"),
        sqlOptions => sqlOptions.EnableRetryOnFailure());
});

// Add file logging
builder.Host.UseSerilog((context, config) => {
    config
        .MinimumLevel.Information()
        .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
        .WriteTo.Console()
        .WriteTo.File(
            path: "Logs/app-log-.txt",
            rollingInterval: RollingInterval.Day,
            outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss} [{Level:u3}] {Message}{NewLine}{Exception}"
        );
});

// Add redis
builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
{
    var redisConfig = ConfigurationOptions.Parse(config.GetConnectionString("Redis"), true);
    return ConnectionMultiplexer.Connect(redisConfig);
});

// Add authentication jwt
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(option =>
{
    option.TokenValidationParameters = new()
    {
        ValidateAudience = true,
        ValidAudience = config.GetSection("JwtConfig")["Audience"],

        ValidateIssuer = true,
        ValidIssuer = config.GetSection("JwtConfig")["Issuer"],

        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero,

        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("SecretKey")!))
    };
})
.AddCookie(options =>
{
    options.Cookie.SameSite = SameSiteMode.Lax;
})
.AddGoogle("Google", options =>
{
    options.ClientId = EnvHelper.GetGoogleClientId();
    options.ClientSecret = EnvHelper.GetGoogleClientSecret();
    options.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.ClaimActions.MapJsonKey("image", "picture");
    options.CallbackPath = "/api/google-login";
});

// Add authorization
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("OnlyAdmin", policy => policy.RequireClaim(ClaimTypes.Role, "Admin"));
});

// Add cor
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowWebClient",
        builder => builder
            .WithOrigins(config.GetSection("AllowedHosts")["Web"])
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

// Add repo
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRoleRepository, RoleRepository>();
builder.Services.AddScoped<IAddressRepository, AddressRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IBookRepository, BookRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IOrderDetailRepository, OrderDetailRepository>();
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<ICancelOrderRequestRespository, CancelOrderRequestRepository>();
builder.Services.AddScoped<ICartRepository, CartRepository>();
builder.Services.AddScoped<ICartItemRepository, CartItemRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();

// Add services
builder.Services.AddTransient<IAuthService, AuthService>();
builder.Services.AddTransient<IUserService, UserService>();
builder.Services.AddTransient<IBookService, BookService>();
builder.Services.AddTransient<IPaymentService, PaymentService>();
builder.Services.AddTransient<ICartService, CartService>();

builder.Services.AddSingleton<IJwtService, JwtService>();
builder.Services.AddSingleton<IRedisService, RedisService>();
builder.Services.AddSingleton<IStorageService, StorageService>();
builder.Services.AddSingleton<IMailService, MailService>();
builder.Services.AddSingleton<IVNAddressDataService, VNAddressDataService>();

// Add middleware
builder.Services.AddSingleton<ExceptionMiddleware>();
builder.Services.AddSingleton<ValidationMiddleware>();
builder.Services.AddSingleton<JwtMiddleware>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    // Change validation error response
    options.InvalidModelStateResponseFactory = context =>
    {
        // Get errors
        var errors = context.ModelState
            .Where(entry => entry.Value.Errors.Count > 0)
            .ToDictionary(
                entry => entry.Key,
                entry => entry.Value.Errors.Select(e => e.ErrorMessage).ToArray() // Danh sách lỗi
            );

        return new BadRequestObjectResult(Helper.ToJsonString(new ApiErrorResult
        {
            IsSuccess = false,
            Errors = errors,
            Message = errors.First().Value[0]
        }));
    };
});

// Fix bug redirect_uri (gg auth) not correct, that cause by nginx redirect from https => http
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedHost;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

var app = builder.Build();
app.UseForwardedHeaders();
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowWebClient");

app.UseHttpsRedirection();

app.UseMiddleware<ExceptionMiddleware>();
app.UseMiddleware<JwtMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using var scope = app.Services.CreateScope();
await SeedData.Init(
        scope.ServiceProvider.GetRequiredService<AppDbContext>(),
        scope.ServiceProvider.GetRequiredService<IRoleRepository>(),
        scope.ServiceProvider.GetRequiredService<IUserRepository>(),
        scope.ServiceProvider.GetRequiredService<ICategoryRepository>()
    );

app.Run();

//
