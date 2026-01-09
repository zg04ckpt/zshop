using Hangfire.Annotations;
using Hangfire.Dashboard;

namespace API.Filters
{
    public class HangfireDashboardAuthorizationFilter : IDashboardAuthorizationFilter
    {
        public bool Authorize(DashboardContext context)
            => context.GetHttpContext().User.IsInRole("admin");
    }
}
