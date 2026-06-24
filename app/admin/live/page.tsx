import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { getAllLiveSessions } from "@/lib/db/liveSessions";
import { setLiveStatusAction } from "@/lib/actions/liveSessions";
import DeleteLiveButton from "@/components/admin/DeleteLiveButton";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Sắp diễn ra",
  live: "Đang live",
  ended: "Đã kết thúc",
};

export default async function AdminLivePage() {
  const sessions = await getAllLiveSessions();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Livestream bán hàng
          </h1>
          <p className="text-slate-500 mt-1">
            Tạo phiên live, ghim sản phẩm và điều khiển trạng thái phát sóng
          </p>
        </div>
        <Link href="/admin/live/new" className={buttonVariants({ className: "rounded-xl" })}>
          + Tạo phiên live
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="py-4">Tiêu đề</TableHead>
              <TableHead className="py-4">Nền tảng</TableHead>
              <TableHead className="py-4">SP ghim</TableHead>
              <TableHead className="py-4">Trạng thái</TableHead>
              <TableHead className="py-4 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((s) => {
              const goLive = setLiveStatusAction.bind(null, s.id, "live");
              const endLive = setLiveStatusAction.bind(null, s.id, "ended");
              return (
                <TableRow key={s.id} className={s.status === "ended" ? "opacity-65" : ""}>
                  <TableCell className="font-semibold text-slate-900 py-4 max-w-xs">
                    <Link href={`/live/${s.id}`} className="hover:underline">
                      {s.title}
                    </Link>
                    {s.hostName && (
                      <span className="block text-xs font-normal text-slate-500 mt-0.5">
                        {s.hostName}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="py-4 capitalize text-slate-600">{s.platform}</TableCell>
                  <TableCell className="py-4 text-slate-600">{s.pinnedProductIds.length}</TableCell>
                  <TableCell className="py-4">
                    {s.status === "live" ? (
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 rounded-lg">
                        {STATUS_LABEL[s.status]}
                      </Badge>
                    ) : s.status === "scheduled" ? (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 rounded-lg">
                        {STATUS_LABEL[s.status]}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 rounded-lg">
                        {STATUS_LABEL[s.status]}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2 py-4 whitespace-nowrap">
                    {s.status !== "live" && (
                      <form action={goLive} className="inline">
                        <Button size="sm" className="h-8 px-3 rounded-lg bg-red-600 hover:bg-red-700">
                          Bắt đầu
                        </Button>
                      </form>
                    )}
                    {s.status === "live" && (
                      <form action={endLive} className="inline">
                        <Button size="sm" variant="outline" className="h-8 px-3 rounded-lg">
                          Kết thúc
                        </Button>
                      </form>
                    )}
                    <Link
                      href={`/admin/live/${s.id}/edit`}
                      className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 px-3 rounded-lg" })}
                    >
                      Sửa
                    </Link>
                    <DeleteLiveButton sessionId={s.id} sessionTitle={s.title} />
                  </TableCell>
                </TableRow>
              );
            })}
            {sessions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                  Chưa có phiên live nào. Tạo phiên đầu tiên để bắt đầu.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
