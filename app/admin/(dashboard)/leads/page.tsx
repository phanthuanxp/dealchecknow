import { QuoteRequestStatus, type Prisma } from "@prisma/client";

import { AdminLeadsManager } from "@/components/admin/leads-manager";
import prisma from "@/lib/prisma";
import { tripTypeLabelMap } from "@/lib/validation";

type LeadStatusFilter = "ALL" | QuoteRequestStatus;
type LeadsSort = "latest" | "oldest";

type AdminLeadsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type LeadsViewModel = {
  databaseReady: boolean;
  items: {
    id: string;
    fullName: string;
    phone: string;
    pickupLocation: string;
    dropoffLocation: string;
    pickupTime: string | null;
    returnTime: string | null;
    vehicleType: string | null;
    message: string | null;
    status: QuoteRequestStatus;
    createdAt: string;
    handledAt: string | null;
    handledByName: string | null;
    passengerCount: number | null;
    luggageCount: number | null;
    utmSource: string | null;
  }[];
  filters: {
    keyword: string;
    status: LeadStatusFilter;
    sort: LeadsSort;
  };
  statusOptions: {
    value: LeadStatusFilter;
    label: string;
    count: number;
  }[];
};

const statusLabelMap: Record<QuoteRequestStatus, string> = {
  NEW: "Chưa xử lý",
  CONTACTED: "Đã liên hệ",
  QUOTED: "Đã báo giá",
  CONFIRMED: "Đã chốt",
  CANCELLED: "Đã hủy"
};

function firstParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function resolveStatusFilter(rawValue: string): LeadStatusFilter {
  if (rawValue in statusLabelMap) {
    return rawValue as QuoteRequestStatus;
  }

  return "ALL";
}

function resolveSort(rawValue: string): LeadsSort {
  if (rawValue === "oldest") {
    return "oldest";
  }

  return "latest";
}

async function getLeadsData(searchParams: Record<string, string | string[] | undefined>): Promise<LeadsViewModel> {
  const keyword = firstParamValue(searchParams.q).trim();
  const status = resolveStatusFilter(firstParamValue(searchParams.status));
  const sort = resolveSort(firstParamValue(searchParams.sort));

  if (!process.env.DATABASE_URL) {
    return {
      databaseReady: false,
      items: [],
      filters: { keyword, status, sort },
      statusOptions: [
        { value: "ALL", label: "Tất cả trạng thái", count: 0 },
        ...Object.entries(statusLabelMap).map(([value, label]) => ({
          value: value as QuoteRequestStatus,
          label,
          count: 0
        }))
      ]
    };
  }

  const where: Prisma.QuoteRequestWhereInput = {};

  if (status !== "ALL") {
    where.status = status;
  }

  if (keyword) {
    where.OR = [
      { pickupLocation: { contains: keyword, mode: "insensitive" } },
      { dropoffLocation: { contains: keyword, mode: "insensitive" } },
      { phone: { contains: keyword, mode: "insensitive" } }
    ];
  }

  try {
    const [leads, groupedStatus] = await Promise.all([
      prisma.quoteRequest.findMany({
        where,
        include: {
          handledBy: {
            select: {
              fullName: true
            }
          }
        },
        orderBy: {
          createdAt: sort === "oldest" ? "asc" : "desc"
        },
        take: 200
      }),
      prisma.quoteRequest.groupBy({
        by: ["status"],
        _count: {
          _all: true
        }
      })
    ]);

    const countByStatus: Record<QuoteRequestStatus, number> = {
      NEW: 0,
      CONTACTED: 0,
      QUOTED: 0,
      CONFIRMED: 0,
      CANCELLED: 0
    };

    for (const row of groupedStatus) {
      countByStatus[row.status] = row._count._all;
    }

    const totalCount = Object.values(countByStatus).reduce((sum, count) => sum + count, 0);

    return {
      databaseReady: true,
      items: leads.map((lead) => ({
        id: lead.id,
        fullName: lead.fullName,
        phone: lead.phone,
        pickupLocation: lead.pickupLocation,
        dropoffLocation: lead.dropoffLocation,
        pickupTime: lead.pickupTime?.toISOString() ?? null,
        returnTime: lead.returnTime?.toISOString() ?? null,
        vehicleType: lead.vehicleType,
        message: lead.message,
        status: lead.status,
        createdAt: lead.createdAt.toISOString(),
        handledAt: lead.handledAt?.toISOString() ?? null,
        handledByName: lead.handledBy?.fullName ?? null,
        passengerCount: lead.passengerCount,
        luggageCount: lead.luggageCount,
        utmSource: lead.utmSource
      })),
      filters: { keyword, status, sort },
      statusOptions: [
        { value: "ALL", label: "Tất cả trạng thái", count: totalCount },
        ...Object.entries(statusLabelMap).map(([value, label]) => ({
          value: value as QuoteRequestStatus,
          label,
          count: countByStatus[value as QuoteRequestStatus]
        }))
      ]
    };
  } catch {
    return {
      databaseReady: false,
      items: [],
      filters: { keyword, status, sort },
      statusOptions: [
        { value: "ALL", label: "Tất cả trạng thái", count: 0 },
        ...Object.entries(statusLabelMap).map(([value, label]) => ({
          value: value as QuoteRequestStatus,
          label,
          count: 0
        }))
      ]
    };
  }
}

export default async function AdminLeadsPage({ searchParams }: AdminLeadsPageProps) {
  const resolvedSearchParams = await searchParams;
  const { items, databaseReady, filters, statusOptions } = await getLeadsData(resolvedSearchParams);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Quản lý lead báo giá</h1>
        <p className="mt-2 text-sm text-slate-600">
          Danh sách yêu cầu báo giá từ website, hỗ trợ lọc nhanh và cập nhật trạng thái chăm sóc khách hàng theo thời gian thực.
        </p>
      </section>

      <AdminLeadsManager
        items={items}
        databaseReady={databaseReady}
        filters={filters}
        statusOptions={statusOptions}
        statusLabelMap={statusLabelMap}
        tripTypeLabelMap={tripTypeLabelMap}
      />
    </div>
  );
}
