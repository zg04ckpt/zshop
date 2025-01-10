using API.Middlewares;
using Core.Repositories;
using Core.Repositories.Impl;
using Core.Services;
using Core.Services.Impl;
using Core.Utilities;
using Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;

// Add services to the container.
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(config.GetConnectionString("SqlServer"));
});

builder.Services.AddTransient<IUserRepository, UserRepository>();
builder.Services.AddTransient<IRoleRepository, RoleRepository>();
builder.Services.AddTransient<IGenderRepository, GenderRepository>();

builder.Services.AddTransient<IAuthService, AuthService>();
builder.Services.AddSingleton<ExceptionMiddleware>();
builder.Services.AddSingleton<IJwtService, JwtService>();
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

app.UseAuthorization();

app.MapControllers();

using var scope = app.Services.CreateScope();
await SeedData.Init(
        scope.ServiceProvider.GetRequiredService<IRoleRepository>(),
        scope.ServiceProvider.GetRequiredService<IGenderRepository>(),
        scope.ServiceProvider.GetRequiredService<IUserRepository>()
    );

app.Run();
