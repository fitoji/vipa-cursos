"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Search,
  Globe,
  MapPin,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  listContinents,
  listCountries,
  searchLocations,
  type ContinentRow,
  type CountryRow,
  type LocationRow,
} from "@/app/actions/locations";
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

// ── Queries ────────────────────────────────────────────────────────────────

const continentsQuery = () => ({
  queryKey: ["locations", "continents"],
  queryFn: () => listContinents(),
});

const countriesQuery = (continentId?: number) => ({
  queryKey: ["locations", "countries", continentId],
  queryFn: () => listCountries(continentId),
  enabled: true,
});

const locationsQuery = (opts: {
  continentId?: number;
  countryId?: number;
  type?: "Center" | "Non-Centre";
  query?: string;
  page: number;
}) => ({
  queryKey: ["locations", "search", opts],
  queryFn: () =>
    searchLocations({
      continentId: opts.continentId,
      countryId: opts.countryId,
      type: opts.type,
      query: opts.query || undefined,
      limit: 20,
      offset: (opts.page - 1) * 20,
    }),
});

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

  const { data: continents = [], isLoading: loadingContinents } = useQuery(
    continentsQuery(),
  );

  const { data: countries = [], isLoading: loadingCountries } = useQuery(
    countriesQuery(filters.continentId),
  );

  const { data: result, isLoading: loadingLocations } = useQuery(
    locationsQuery({ ...filters, page }),
  );

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
        header: "Nombre",
        cell: (i) => (
          <span className="font-medium">{i.getValue()}</span>
        ),
      }),
      columnHelper.accessor("type", {
        header: "Tipo",
        cell: (i) => (
          <Badge variant={i.getValue() === "Center" ? "default" : "secondary"}>
            {i.getValue() === "Center" ? "Centro" : "Non-Centre"}
          </Badge>
        ),
      }),
      columnHelper.accessor("country_name", { header: "País" }),
      columnHelper.accessor("city", {
        header: "Ciudad",
        cell: (i) => i.getValue() || "—",
      }),
      columnHelper.accessor("state", {
        header: "Estado/Provincia",
        cell: (i) => i.getValue() || i.row.original.province || "—",
      }),
      columnHelper.accessor("continent_name", {
        header: "Continente",
        cell: (i) => (
          <span className="text-muted-foreground">{i.getValue()}</span>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: locations,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Continents */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          Continente
        </h3>
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
              className="rounded-full"
              onClick={() => setContinent(undefined)}
            >
              Todos
            </Button>
            {continents.map((c) => (
              <Button
                key={c.id}
                size="sm"
                variant={filters.continentId === c.id ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setContinent(c.id)}
              >
                {c.name}
                <Badge
                  variant="secondary"
                  className="ml-1.5 h-5 min-w-5 px-1 text-xs"
                >
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
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, ciudad o país…"
            className="pl-9"
          />
        </div>

        {/* Country select */}
        <div className="min-w-[200px]">
          <Select
            value={filters.countryId?.toString() ?? "all"}
            onValueChange={(v) =>
              setCountry(v === "all" ? undefined : Number(v))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos los países" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los países</SelectItem>
              {countries.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.name}
                  <span className="ml-1 text-muted-foreground">
                    ({c.location_count})
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type select */}
        <div className="min-w-[160px]">
          <Select
            value={filters.type ?? "all"}
            onValueChange={(v) =>
              setType(
                v === "all" ? undefined : (v as "Center" | "Non-Centre"),
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="Center">Centros</SelectItem>
              <SelectItem value="Non-Centre">Non-Centres</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active filters summary */}
      {(selectedContinent || selectedCountry || filters.type || filters.query) && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>Filtros activos:</span>
          {selectedContinent && (
            <Badge variant="outline" className="gap-1">
              <Globe className="h-3 w-3" />
              {selectedContinent.name}
            </Badge>
          )}
          {selectedCountry && (
            <Badge variant="outline" className="gap-1">
              <MapPin className="h-3 w-3" />
              {selectedCountry.name}
            </Badge>
          )}
          {filters.type && (
            <Badge variant="outline" className="gap-1">
              <Building2 className="h-3 w-3" />
              {filters.type === "Center" ? "Centros" : "Non-Centres"}
            </Badge>
          )}
          {filters.query && (
            <Badge variant="outline" className="gap-1">
              <Search className="h-3 w-3" />"{filters.query}"
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
            Limpiar
          </Button>
        </div>
      )}

      {/* Results */}
      <Card>
        <CardContent className="p-0">
          {loadingLocations ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : locations.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
              <MapPin className="h-8 w-8 opacity-40" />
              <p className="text-sm">No se encontraron centros con esos filtros.</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((hg) => (
                      <TableRow key={hg.id}>
                        {hg.headers.map((h) => (
                          <TableHead key={h.id}>
                            {h.isPlaceholder
                              ? null
                              : flexRender(
                                  h.column.columnDef.header,
                                  h.getContext(),
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
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
                  {total} resultado{total === 1 ? "" : "s"}
                  {totalPages > 1 && (
                    <>
                      {" "}
                      — página {page} de {totalPages}
                    </>
                  )}
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
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
