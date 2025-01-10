using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Common
{
    public class ApiResult
    {
        public bool IsSuccess { get; set; }
        public string? Message { get; set; }
        
    }

    public class ApiResult<TData> : ApiResult where TData : class
    {
        public TData Data { get; set; }
    }

    public class ApiSuccessResult : ApiResult
    {
        public ApiSuccessResult()
        {
            IsSuccess = true;
        }

        public ApiSuccessResult(string message)
        {
            IsSuccess = true;
            Message = message;
        }
    }

    public class ApiSuccessResult<TData> : ApiResult<TData> where TData : class
    {
        public ApiSuccessResult(string message, TData data)
        {
            IsSuccess = true;
            Message = message;
            Data = data;
        }

        public ApiSuccessResult(TData data)
        {
            IsSuccess = true;
            Data = data;
        }
    }

    public class ApiErrorResult : ApiResult
    {
        public object? Errors { get; set; }
        public ApiErrorResult()
        {
            IsSuccess = false;
        }

        public ApiErrorResult(string message)
        {
            IsSuccess = false;
            Message = message;
        }

        public ApiErrorResult(Exception ex)
        {
            IsSuccess = false;
            Message = ex.Message;
        }

        public ApiErrorResult(string message, object errors)
        {
            IsSuccess = false;
            Message = message;
            Errors = errors;
        }
    }
}
