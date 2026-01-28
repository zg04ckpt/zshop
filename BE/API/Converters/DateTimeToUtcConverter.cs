using System.Runtime.InteropServices;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace API.Converters
{
    public class DateTimeToUtcConverter : JsonConverter<DateTime>
    {
        public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            var str = reader.GetString();
            if (string.IsNullOrEmpty(str)) return default;

            if (DateTime.TryParse(str, null, System.Globalization.DateTimeStyles.RoundtripKind, out var dt))
            {
                if (dt.Kind == DateTimeKind.Unspecified)
                {
                    var tz = TimeZoneInfo.FindSystemTimeZoneById(
                        RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
                            ? "SE Asia Standard Time"
                            : "Asia/Bangkok"
                    );
                    return TimeZoneInfo.ConvertTimeToUtc(dt, tz);
                }

                return dt.ToUniversalTime();
            }

            return default;
        }

        public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
        {
            writer.WriteStringValue(value.ToString("yyyy-MM-ddTHH:mm:ss.fff") + "Z");
        }
    }
}
