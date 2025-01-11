using API.Middlewares;
using Core.Repositories;
using Core.Repositories.Impl;
using Core.Services;
using Core.Services.Impl;
using Core.Utilities;
using Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StackExchange.Redis;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;

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

builder.Services.AddTransient<IUserRepository, UserRepository>();
builder.Services.AddTransient<IRoleRepository, RoleRepository>();
builder.Services.AddTransient<IGenderRepository, GenderRepository>();

builder.Services.AddTransient<IAuthService, AuthService>();

builder.Services.AddSingleton<ExceptionMiddleware>();
builder.Services.AddSingleton<JwtMiddleware>();
builder.Services.AddSingleton<IJwtService, JwtService>();
builder.Services.AddSingleton<IRedisService, RedisService>();
builder.Services.AddSingleton<IStorageService, StorageService>();
builder.Services.AddSingleton<IMailService, MailService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

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
