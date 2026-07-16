"use client";


import { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Search, Globe, MapPin, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  listContinents,
  listCountries,
  searchLocations,
  type ContinentRow,
  type CountryRow,
  type LocationRow,
} from "@/app/actions/locations";
import { useCachedQuery } from "@/hooks/use-cached-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useInView, staggerDelay } from "@/lib/animations";
import { cn } from "@/lib/utils";

// ── Component ──────────────────────────────────────────────────────────────

type Filters = {
  continentId?: number;
  countryId?: number;
  type?: "Center" | "Non-Centre";
  query: string;
};

const PAGE_SIZE = 20;

export function LocationsExplorer() {
  const [filters, setFilters] = useState<Filters>({ query: "" });
  const [page, setPage] = useState(1);
  const [tableRef, tableInView] = useInView(0.05);
  const t = useTranslations("LocationsExplorer");

  const { data: continents = [], isLoading: loadingContinents } = useCachedQuery({
    queryKey: ["locations", "continents"],
    queryFn: () => listContinents(),
    cacheKey: "locations:continents",
  });

  const { data: countries = [], isLoading: loadingCountries } = useCachedQuery({
    queryKey: ["locations", "countries", filters.continentId],
    queryFn: () => listCountries(filters.continentId),
    cacheKey: `locations:countries:${filters.continentId ?? "all"}`,
  });

  const searchCacheKey = `locations:search:${filters.continentId ?? "all"}:${filters.countryId ?? "all"}:${filters.type ?? "all"}:${filters.query ?? "all"}:${page}`;

  const { data: result, isLoading: loadingLocations } = useCachedQuery({
    queryKey: ["locations", "search", { ...filters, page }],
    queryFn: () =>
      searchLocations({
        continentId: filters.continentId,
        countryId: filters.countryId,
        type: filters.type,
        query: filters.query || undefined,
        limit: 20,
        offset: (page - 1) * 20,
      }),
    cacheKey: searchCacheKey,
  });

  const locations = result?.locations ?? [];
  const total = result?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const selectedContinent = continents.find((c) => c.id === filters.continentId);
  const selectedCountry = countries.find((c) => c.id === filters.countryId);

  // ── Handlers ───────────────────────────────────────────────────────────

  const setContinent = (id: number | undefined) => {
    setFilters((f) => ({ ...f, continentId: id, countryId: undefined }));
    setPage(1);
  };

  const setCountry = (id: number | undefined) => {
    setFilters((f) => ({ ...f, countryId: id }));
    setPage(1);
  };

  const setType = (type: "Center" | "Non-Centre" | undefined) => {
    setFilters((f) => ({ ...f, type }));
    setPage(1);
  };

  const setQuery = (query: string) => {
    setFilters((f) => ({ ...f, query }));
    setPage(1);
  };

  // ── Table columns ──────────────────────────────────────────────────────

  const columnHelper = createColumnHelper<LocationRow>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: t("table.header.name"),
        cell: (i) => <span className="font-medium">{i.getValue()}</span>,
      }),
      columnHelper.accessor("type", {
        header: t("table.header.type"),
        cell: (i) => (
          <Badge variant={i.getValue() === "Center" ? "default" : "secondary"}>
            {i.getValue() === "Center" ? t("typeCenter") : t("typeNonCentre")}
          </Badge>
        ),
      }),
      columnHelper.accessor("country_name", { header: t("table.header.country") }),
      columnHelper.accessor("city", {
        header: t("table.header.city"),
        cell: (i) => i.getValue() || "—",
      }),
      columnHelper.accessor("state", {
        header: t("table.header.state"),
        cell: (i) => i.getValue() || i.row.original.province || "—",
      }),
      columnHelper.accessor("continent_name", {
        header: t("table.header.continent"),
        cell: (i) => <span className="text-muted-foreground">{i.getValue()}</span>,
      }),
    ],
    [t],
  );

  const table = useReactTable({
    data: locations,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* Continents */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">{t("continentLabel")}</h3>
        {loadingContinents ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-28 rounded-full" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={!filters.continentId ? "default" : "outline"}
              className="rounded-full card-interactive"
              onClick={() => setContinent(undefined)}
            >
              {t("allContinents")}
            </Button>
            {continents.map((c) => (
              <Button
                key={c.id}
                size="sm"
                variant={filters.continentId === c.id ? "default" : "outline"}
                className="rounded-full card-interactive"
                onClick={() => setContinent(c.id)}
              >
                {c.name}
                <Badge variant="secondary" className="ml-1.5 h-5 min-w-5 px-1 text-xs">
                  {c.location_count}
                </Badge>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Search */}
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-9"
          />
        </div>

        {/* Country select */}
        <div className="min-w-[200px]">
          <Select
            value={filters.countryId?.toString() ?? "all"}
            onValueChange={(v) => setCountry(v === "all" ? undefined : Number(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("countrySelectPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allCountries")}</SelectItem>
              {countries.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.name}
                  <span className="ml-1 text-muted-foreground">({c.location_count})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type select */}
        <div className="min-w-[160px]">
          <Select
            value={filters.type ?? "all"}
            onValueChange={(v) => setType(v === "all" ? undefined : (v as "Center" | "Non-Centre"))}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("typeSelectPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allTypes")}</SelectItem>
              <SelectItem value="Center">{t("typeCenter")}</SelectItem>
              <SelectItem value="Non-Centre">Non-Centres</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active filters summary */}
      {(selectedContinent || selectedCountry || filters.type || filters.query) && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>{t("activeFilters")}</span>
          {selectedContinent && (
            <Badge variant="outline" className="gap-1 anim-slide-left">
              <Globe className="size-3" />
              {selectedContinent.name}
            </Badge>
          )}
          {selectedCountry && (
            <Badge variant="outline" className="gap-1 anim-slide-left" style={staggerDelay(1)}>
              <MapPin className="size-3" />
              {selectedCountry.name}
            </Badge>
          )}
          {filters.type && (
            <Badge variant="outline" className="gap-1 anim-slide-left" style={staggerDelay(2)}>
              <Building2 className="size-3" />
              {filters.type === "Center" ? t("typeCenter") : t("typeNonCentre")}
            </Badge>
          )}
          {filters.query && (
            <Badge variant="outline" className="gap-1 anim-slide-left" style={staggerDelay(3)}>
              <Search className="size-3" />"{filters.query}"
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => {
              setFilters({ query: "" });
              setPage(1);
            }}
          >
            {t("clearFilters")}
          </Button>
        </div>
      )}

      {/* Results */}
      <Card>
        <CardContent className="p-0">
          {loadingLocations ? (
            <div className="flex flex-col gap-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : locations.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
              <MapPin className="size-8 opacity-40" />
              <p className="text-sm">{t("noResults")}</p>
            </div>
          ) : (
            <>
              <div ref={tableRef} className="rounded-md border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((hg) => (
                      <TableRow key={hg.id}>
                        {hg.headers.map((h) => (
                          <TableHead key={h.id}>
                            {h.isPlaceholder
                              ? null
                              : flexRender(h.column.columnDef.header, h.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.map((row, i) => (
                      <TableRow
                        key={row.id}
                        className={cn(tableInView && "anim-fade-up")}
                        style={tableInView ? staggerDelay(i, 40) : undefined}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  {t("pagination.resultCount", { total, tplural: total === 1 ? "" : "s" })}
                  {totalPages > 1 && <> {t("pagination.pageInfo", { page, totalPages })}</>}
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
