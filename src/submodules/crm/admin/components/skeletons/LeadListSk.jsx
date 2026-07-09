const LeadListSk = () => {
  const shimmerClass =
    "relative overflow-hidden bg-slate-200 before:absolute before:inset-0 before:w-[200%] before:-translate-x-1/2 before:animate-[shimmer_2.4s_linear_infinite] before:bg-[linear-gradient(90deg,rgba(226,232,240,0)_0%,rgba(255,255,255,0.2)_35%,rgba(255,255,255,0.55)_50%,rgba(255,255,255,0.2)_65%,rgba(226,232,240,0)_100%)]";
  const softClass =
    "relative overflow-hidden bg-slate-100 before:absolute before:inset-0 before:w-[200%] before:-translate-x-1/2 before:animate-[shimmer_2.8s_linear_infinite] before:bg-[linear-gradient(90deg,rgba(241,245,249,0)_0%,rgba(255,255,255,0.18)_35%,rgba(255,255,255,0.45)_50%,rgba(255,255,255,0.18)_65%,rgba(241,245,249,0)_100%)]";

  return (
    <div className="bg-slate-50 p-4 font-sans">
      <style>
        {`
          @keyframes shimmer {
            0% {
              transform: translateX(-25%);
            }
            100% {
              transform: translateX(25%);
            }
          }
        `}
      </style>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Dashboard header skeleton */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
            <div className={`h-8 w-48 rounded-lg ${shimmerClass}`}></div>
            <div className="flex gap-3">
              <div className={`h-9 w-32 rounded-lg ${softClass}`}></div>
              <div className={`h-9 w-32 rounded-lg ${softClass}`}></div>
            </div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-linear-to-t from-slate-100 to-white">
            <div className="flex justify-between items-center">
              <div className={`h-5 w-32 rounded ${shimmerClass}`}></div>
              <div className="flex items-center gap-2">
                <div className={`h-8 w-24 rounded-md ${softClass}`}></div>
                <div className={`h-8 w-24 rounded-md ${shimmerClass}`}></div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-white border-b border-slate-200">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <th key={i} className="px-4 py-3 text-left">
                      <div className={`h-3 w-16 rounded ${softClass}`} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div
                          className={`size-8  rounded-full shrink-0 mr-3 ${softClass}`}
                        ></div>
                        <div className="space-y-2">
                          <div className={`h-4 w-32 rounded ${shimmerClass}`}></div>
                          <div className={`h-3 w-24 rounded ${softClass}`}></div>
                          <div className={`h-3 w-40 rounded ${softClass}`}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`h-4 w-16 rounded ${softClass}`}></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`h-4 w-20 rounded ${softClass}`}></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`h-4 w-20 rounded ${softClass}`}></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`h-4 w-16 rounded ${softClass}`}></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`h-7 w-20 rounded-md ${shimmerClass}`}></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div
                          className={`size-6  rounded mr-2 ${softClass}`}
                        ></div>
                        <div className="space-y-1.5">
                          <div className={`h-3 w-20 rounded ${softClass}`}></div>
                          <div className={`h-2.5 w-16 rounded ${softClass}`}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1.5">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div
                            key={i}
                            className={`size-7  rounded ${softClass}`}
                          ></div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadListSk;
