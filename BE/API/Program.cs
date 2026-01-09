using API.Converters;
using API.Filters;
using API.Middlewares;
using Core.Configurations;
using Core.DTOs.Common;
using Core.Interfaces;
using Core.Interfaces.Repositories;
using Core.Interfaces.Services;
using Core.Interfaces.Services.External;
using Core.Repositories.Impl;
using Core.Services;
using Core.Services.External;
using Core.Utilities;
using Data;
using Data.Repositories;
using Hangfire;
using Hangfire.MySql;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Serilog.Events;
using StackExchange.Redis;
using System.Security.Claims;
using System.Text;
using System.Transactions;

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;

builder.Services.AddHttpContextAccessor();

// Add config mapping
builder.Services.Configure<JwtConfig>(config.GetSection("JwtConfig"));
builder.Services.Configure<AuthConfig>(config.GetSection("AuthConfig"));
builder.Services.Configure<MailConfig>(config.GetSection("MailConfig"));
builder.Services.Configure<VNPayConfig>(config.GetSection("VNPayConfig"));
builder.Services.Configure<PaymentConfig>(config.GetSection("PaymentConfig"));

// Add myserver service to the container.
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseMySql(
        EnvHelper.GetMySQLConnectionString(),
        new MySqlServerVersion(new Version(8, 0, 37)));
});

// Add file logging
builder.Host.UseSerilog((context, config) => {
    config
        .MinimumLevel.Information()
        .WriteTo.Console()
        .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
        .WriteTo.File(
            path: Path.Combine(AppContext.BaseDirectory, "logs", ".txt"),
            rollingInterval: RollingInterval.Day,
            outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss} [{Level:u3}] {Message}{NewLine}{Exception}"
        );
});
builder.Logging.ClearProviders(); 
builder.Logging.AddSerilog();

// Add redis
builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
{
    var configs = builder.Configuration.GetSection("Redis").Get<RedisConfig>();
    var redisConfig = new ConfigurationOptions
    {
        EndPoints = { configs.EndPoints.Default },
        Password = EnvHelper.GetRedisPassword(),
        Ssl = configs.Ssl,
        ConnectTimeout = configs.ConnectTimeout,
        SyncTimeout = configs.SyncTimeout,
        ConnectRetry = configs.ConnectRetry
    };
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


//// Add hangfire
//builder.Services.AddHangfire(config => config
//    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
//    .UseSimpleAssemblyNameTypeSerializer()
//    .UseRecommendedSerializerSettings()
//    .UseStorage( 
//        new MySqlStorage(
//            EnvHelper.GetMySQLConnectionString(),
//            new MySqlStorageOptions
//            {
//                QueuePollInterval = TimeSpan.FromSeconds(30),
//                JobExpirationCheckInterval = TimeSpan.FromHours(1),
//                CountersAggregateInterval = TimeSpan.FromMinutes(5),
//                PrepareSchemaIfNecessary = true,
//                DashboardJobListLimit = 5000,
//                TransactionIsolationLevel = IsolationLevel.ReadCommitted,
//                TablesPrefix = "Hangfire"
//            })
//    ));

//builder.Services.AddHangfireServer();

// Add repo
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IBookRepository, BookRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<SeedData>();

//builder.Services.AddScoped<IRoleRepository, RoleRepository>();
//builder.Services.AddScoped<IAddressRepository, AddressRepository>();
//builder.Services.AddScoped<IOrderRepository, OrderRepository>();
//builder.Services.AddScoped<IOrderDetailRepository, OrderDetailRepository>();
//builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
//builder.Services.AddScoped<ICancelOrderRequestRespository, CancelOrderRequestRepository>();
//builder.Services.AddScoped<ICartRepository, CartRepository>();
//builder.Services.AddScoped<ICartItemRepository, CartItemRepository>();
//builder.Services.AddScoped<IVoucherRepository, VoucherRepository>();

// Add services
builder.Services.AddTransient<IAuthService, AuthService>();
builder.Services.AddTransient<IUserService, UserService>();
builder.Services.AddTransient<IBookService, BookService>();
builder.Services.AddTransient<IPaymentService, PaymentService>();
builder.Services.AddTransient<ICartService, CartService>();
builder.Services.AddTransient<IVoucherService, VoucherService>();

builder.Services.AddSingleton<IJwtService, JwtService>();
builder.Services.AddSingleton<IRedisService, RedisService>();
builder.Services.AddSingleton<IStorageService, StorageService>();
builder.Services.AddSingleton<IMailService, MailService>();
builder.Services.AddSingleton<IVNAddressDataService, VNAddressDataService>();

// Add middleware
builder.Services.AddSingleton<JwtCookieMiddleware>();
builder.Services.AddSingleton<ExceptionMiddleware>();
builder.Services.AddSingleton<JwtMiddleware>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.Converters.Add(new DateTimeToUtcConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddRouting(options =>
{
    options.LowercaseUrls = true;
});

// Config validation error
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

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 512L * 1024 * 1024;
});

var app = builder.Build();

//app.UseHangfireDashboard("/hangfire", new DashboardOptions
//{
//    Authorization = new[] { new HangfireDashboardAuthorizationFilter() },
//    DashboardTitle = "ZShop – Hangfire Dashboard"
//});

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
app.UseMiddleware<JwtCookieMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using var scope = app.Services.CreateScope();
var seeder = scope.ServiceProvider.GetRequiredService<SeedData>();
await seeder.InitAsync();

app.Run();
