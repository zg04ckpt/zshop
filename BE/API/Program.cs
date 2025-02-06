using API.Middlewares;
using Core.Configurations;
using Core.DTOs.Common;
using Core.Repositories;
using Core.Repositories.Impl;
using Core.Services;
using Core.Services.Impl;
using Core.Utilities;
using Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StackExchange.Redis;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;

// Add config mapping
builder.Services.Configure<JwtConfig>(config.GetSection("JwtConfig"));
builder.Services.Configure<AuthConfig>(config.GetSection("AuthConfig"));
builder.Services.Configure<MailConfig>(config.GetSection("MailConfig"));

// Add sqlserver service to the container.
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(config.GetConnectionString("SqlServer"));
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



builder.Services.AddTransient<IUserRepository, UserRepository>();
builder.Services.AddTransient<IRoleRepository, RoleRepository>();
builder.Services.AddTransient<IGenderRepository, GenderRepository>();

builder.Services.AddTransient<IAuthService, AuthService>();

builder.Services.AddSingleton<ExceptionMiddleware>();
builder.Services.AddSingleton<ValidationMiddleware>();
builder.Services.AddSingleton<JwtMiddleware>();

builder.Services.AddSingleton<IJwtService, JwtService>();
builder.Services.AddSingleton<IRedisService, RedisService>();
builder.Services.AddSingleton<IStorageService, StorageService>();
builder.Services.AddSingleton<IMailService, MailService>();

builder.Services.AddControllers();
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
            Message = "Định dạng không hợp lệ."
        }));
    };
});

var app = builder.Build();

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
        scope.ServiceProvider.GetRequiredService<IRoleRepository>(),
        scope.ServiceProvider.GetRequiredService<IGenderRepository>(),
        scope.ServiceProvider.GetRequiredService<IUserRepository>()
    );

app.Run();

//
