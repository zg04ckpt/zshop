﻿
using Core.DTOs.Common;
using Core.Exceptions;
using Newtonsoft.Json;
using System.Net;

namespace API.Middlewares
{
    public class ExceptionMiddleware : IMiddleware
    {
        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            try
            {
                await next(context);
            }
            catch (Exception ex)
            {
                await HandleException(ex, context);
            }
        }

        private async Task HandleException(Exception ex, HttpContext context)
        {
            if (ex is BadRequestException)
            {
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                await context.Response.WriteAsync(JsonConvert.SerializeObject(new ApiErrorResult(ex)));
            }    
            else
            {
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                await context.Response.WriteAsync(JsonConvert.SerializeObject(new ApiErrorResult("Lỗi không xác định")));
            }
        }
    }
}