using Core.Exceptions;
using System.Reflection;

namespace Core.Utilities
{
    public static class ExtentionMethod
    {
        public static T? GetPropertyValue<T>(this object obj, string nameOfProperty)
        {
            if (obj is null || nameOfProperty is null)
                throw new BadRequestException("Thuộc tính hoặc tên trường không hợp lệ.");

            nameOfProperty = char.ToUpperInvariant(nameOfProperty[0]) + nameOfProperty.Substring(1);
            Type type = obj.GetType();
            PropertyInfo property = type.GetProperty(nameOfProperty)
                ?? throw new BadRequestException("Thuộc tính không tồn tại.");
            return (T?)property.GetValue(obj);
        }

        public static object? GetPropertyValue(this object obj, string nameOfProperty)
        {
            if (obj is null || nameOfProperty is null)
                throw new BadRequestException("Thuộc tính hoặc tên trường không hợp lệ.");

            nameOfProperty = char.ToUpperInvariant(nameOfProperty[0]) + nameOfProperty.Substring(1);
            Type type = obj.GetType();
            PropertyInfo property = type.GetProperty(nameOfProperty)
                ?? throw new BadRequestException("Thuộc tính không tồn tại.");
            return property.GetValue(obj);
        }

        /// <summary>
        /// Lowercase equal between a and b
        /// </summary>
        /// <param name="a"></param>
        /// <param name="b"></param>
        /// <returns></returns>
        public static bool LCEqual(this string a,  string b)
        {
            return a.ToLower() == b.ToLower();
        }
    }
}
