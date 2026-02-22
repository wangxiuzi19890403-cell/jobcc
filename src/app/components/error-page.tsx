import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { AlertCircle } from "lucide-react";

export function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  const message = isRouteErrorResponse(error)
    ? error.statusText || error.data?.message || "页面出错"
    : error instanceof Error
      ? error.message
      : "发生了一些错误";

  const status = isRouteErrorResponse(error) ? error.status : null;

  return (
    <div className="flex h-full min-h-screen w-full flex-col items-center justify-center bg-neutral-50 px-4">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircle className="size-7" />
        </div>
        <h1 className="text-lg font-semibold text-neutral-900">
          {status ? `错误 ${status}` : "出错了"}
        </h1>
        <p className="mt-2 text-sm text-neutral-600">{message}</p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            返回
          </Button>
          <Button onClick={() => navigate("/")}>
            回到首页
          </Button>
        </div>
      </div>
    </div>
  );
}
