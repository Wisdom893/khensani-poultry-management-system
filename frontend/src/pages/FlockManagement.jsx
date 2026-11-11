
import { useEffect, useState } from "react";
import { getPoultryHouses } from "../api/poultryHouseService";
import { createFlock, getFlocks, updateFlock, getFlockStatistics, } from "../api/flockService";
import { createMortalityRecord, getMortalityRecordsByFlock, } from "../api/mortalityService";
import { getMyPermissions } from "../api/myPermissionService";

const EMPTY_FORM = {
  flockReference: "",
  breed: "",
  placementDate: new Date().toISOString().slice(0, 10),
  initialBirdCount: "",
  supplier: "",
  status: "ACTIVE",
  poultryHouseId: "",
};

const STATUS_STYLES = {
  ACTIVE: "bg-green-100 text-green-800",
  COMPLETED: "bg-blue-100 text-blue-800",
  CLOSED: "bg-gray-100 text-gray-600",
};

function SummaryCard({ label, value, detail }) {
  return (
    <div className="rounded-2xl border border-[#e5e9df] bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-[#254d32]">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{detail}</p>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function FlockManagement() {
  const [flocks, setFlocks] = useState([]);
  const [houses, setHouses] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showFlockForm, setShowFlockForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [permissionLevel, setPermissionLevel] = useState('NONE');
  const [permissionLoading, setPermissionLoading] = useState(true);
  const [selectedFlock, setSelectedFlock] = useState(null);
  const [mortalityRecords, setMortalityRecords] = useState([]);
  const [showMortalityForm, setShowMortalityForm] = useState(false);
  const [mortalityForm, setMortalityForm] = useState({
    mortalityDate: new Date().toISOString().slice(0, 10),
    numberOfDeaths: "",
    reason: "UNKNOWN",
    notes: "",
  });

  useEffect(() => {
    let cancelled = false;

    const savedUser = JSON.parse(
      sessionStorage.getItem("khensani_user") || "{}"
    );

    if (savedUser.role === "SUPER_ADMIN") {
      Promise.resolve().then(() => {
        if (!cancelled) {
          setPermissionLevel("FULL");
          setPermissionLoading(false);
        }
      });

      return () => {
        cancelled = true;
      };
    }

    getMyPermissions()
      .then((data) => {
        if (!cancelled) {
          const flockPermission = data.find(
            (item) => item.systemModule === "FLOCK_MANAGEMENT"
          );

          setPermissionLevel(
            flockPermission?.permissionLevel || "NONE"
          );
        }
      })
      .catch((error) => {
        console.error("Unable to load flock permissions:", error);
        if (!cancelled) {
          setPermissionLevel("NONE");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setPermissionLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const canView = permissionLevel !== "NONE";
  const canCreate = ["CREATE", "EDIT", "FULL"].includes(permissionLevel);
  const canEdit = ["EDIT", "FULL"].includes(permissionLevel);
  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [flockData, houseData] = await Promise.all([
        getFlocks(),
        getPoultryHouses(),
      ]);

      const flockList = Array.isArray(flockData) ? flockData : [];
      const houseList = Array.isArray(houseData) ? houseData : [];

      setFlocks(flockList);
      setHouses(houseList);

      const results = await Promise.all(
        flockList.map(async (flock) => {
          try {
            const stats = await getFlockStatistics(flock.id);
            return [flock.id, stats];
          } catch {
            return [
              flock.id,
              {
                totalDeaths: 0,
                currentBirdCount: flock.initialBirdCount,
                mortalityRate: 0,
              },
            ];
          }
        })
      );

      setStatistics(Object.fromEntries(results));
    } catch (err) {
      setError(err.message || "Unable to load flock data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [flockData, houseData] = await Promise.all([
          getFlocks(),
          getPoultryHouses(),
        ]);

        const flockList = Array.isArray(flockData) ? flockData : [];
        const houseList = Array.isArray(houseData) ? houseData : [];

        const results = await Promise.all(
          flockList.map(async (flock) => {
            try {
              const stats = await getFlockStatistics(flock.id);
              return [flock.id, stats];
            } catch {
              return [
                flock.id,
                {
                  totalDeaths: 0,
                  currentBirdCount: flock.initialBirdCount,
                  mortalityRate: 0,
                },
              ];
            }
          })
        );

        if (!cancelled) {
          setFlocks(flockList);
          setHouses(houseList);
          setStatistics(Object.fromEntries(results));
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load flock data.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeFlocks = flocks.filter(
    (flock) => flock.status === "ACTIVE"
  );

  const totalInitialBirds = flocks.reduce(
    (sum, flock) => sum + Number(flock.initialBirdCount || 0),
    0
  );

  const totalCurrentBirds = flocks.reduce(
    (sum, flock) =>
      sum +
      Number(
        statistics[flock.id]?.currentBirdCount ??
        flock.initialBirdCount ??
        0
      ),
    0
  );

  const totalDeaths = flocks.reduce(
    (sum, flock) =>
      sum + Number(statistics[flock.id]?.totalDeaths || 0),
    0
  );

  const filteredFlocks = flocks.filter((flock) => {
    const query = search.trim().toLowerCase();
    const house = houses.find(
      (item) => item.id === flock.poultryHouse?.id
    );

    const matchesSearch = [
      flock.flockReference,
      flock.breed,
      flock.supplier,
      house?.name,
      house?.houseNumber,
    ].some((value) =>
      String(value || "").toLowerCase().includes(query)
    );

    const matchesStatus =
      statusFilter === "ALL" || flock.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  function openCreateForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setSuccess("");
    setShowFlockForm(true);
  }

  function openEditForm(flock) {
    setEditingId(flock.id);
    setForm({
      flockReference: flock.flockReference || "",
      breed: flock.breed || "",
      placementDate: flock.placementDate || "",
      initialBirdCount: String(flock.initialBirdCount ?? ""),
      supplier: flock.supplier || "",
      status: flock.status || "ACTIVE",
      poultryHouseId: String(flock.poultryHouse?.id ?? ""),
    });
    setError("");
    setSuccess("");
    setShowFlockForm(true);
  }

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleFlockSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      flockReference: form.flockReference.trim(),
      breed: form.breed.trim(),
      placementDate: form.placementDate,
      initialBirdCount: Number(form.initialBirdCount),
      supplier: form.supplier.trim(),
      status: form.status,
      poultryHouse: {
        id: Number(form.poultryHouseId),
      },
    };

    try {
      if (editingId !== null) {
        await updateFlock(editingId, payload);
        setSuccess("Flock updated successfully.");
      } else {
        await createFlock(payload);
        setSuccess("Flock registered successfully.");
      }

      setShowFlockForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to save flock.");
    } finally {
      setSaving(false);
    }
  }

  async function openFlockDetails(flock) {
    setSelectedFlock(flock);
    setShowMortalityForm(false);
    setError("");
    setSuccess("");

    try {
      const records = await getMortalityRecordsByFlock(flock.id);
      setMortalityRecords(Array.isArray(records) ? records : []);
    } catch (err) {
      setMortalityRecords([]);
      setError(err.message || "Unable to load mortality history.");
    }
  }

  async function handleMortalitySubmit(event) {
    event.preventDefault();

    if (!selectedFlock) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await createMortalityRecord(selectedFlock.id, {
        mortalityDate: mortalityForm.mortalityDate,
        numberOfDeaths: Number(mortalityForm.numberOfDeaths),
        reason: mortalityForm.reason,
        notes: mortalityForm.notes.trim(),
      });

      const records = await getMortalityRecordsByFlock(selectedFlock.id);
      setMortalityRecords(records);
      setMortalityForm({
        mortalityDate: new Date().toISOString().slice(0, 10),
        numberOfDeaths: "",
        reason: "UNKNOWN",
        notes: "",
      });
      setShowMortalityForm(false);
      setSuccess("Mortality record saved successfully.");
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to save mortality record.");
    } finally {
      setSaving(false);
    }
  }

  if (permissionLoading) {
    return (
      <div className="rounded-2xl border border-[#e5e9df] bg-white p-10 text-center text-sm text-gray-500">
        Loading permissions...
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <h2 className="text-lg font-bold text-red-800">Access Denied</h2>
        <p className="mt-2 text-sm text-red-700">
          You do not have permission to view Flock Management.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-[#66816b]">
            Farm Operations
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#254d32]">
            Flock Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage bird batches, poultry house assignments and daily mortality.
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-xl bg-[#2f6840] px-5 py-3 text-sm font-semibold text-white hover:bg-[#245332]"
          >
            + Register Flock
          </button>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Flocks"
          value={flocks.length}
          detail="Registered bird batches"
        />
        <SummaryCard
          label="Active Flocks"
          value={activeFlocks.length}
          detail="Currently in production"
        />
        <SummaryCard
          label="Current Birds"
          value={totalCurrentBirds.toLocaleString()}
          detail="Calculated from recorded deaths"
        />
        <SummaryCard
          label="Total Mortality"
          value={totalDeaths.toLocaleString()}
          detail={`Initial birds: ${totalInitialBirds.toLocaleString()}`}
        />
      </div>

      {showFlockForm && (editingId === null ? canCreate : canEdit) && (
        <section className="rounded-2xl border border-[#e5e9df] bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-[#254d32]">
            {editingId !== null ? "Edit Flock" : "Register New Flock"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Assign the flock to an existing active poultry house.
          </p>

          <form onSubmit={handleFlockSubmit} className="mt-5 space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <label htmlFor="flockReference" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Flock Reference *
                </label>
                <input
                  id="flockReference"
                  name="flockReference"
                  value={form.flockReference}
                  onChange={handleFormChange}
                  placeholder="e.g. FL-001"
                  maxLength={50}
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#4b8057]"
                />
              </div>

              <div>
                <label htmlFor="breed" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Breed *
                </label>
                <input
                  id="breed"
                  name="breed"
                  value={form.breed}
                  onChange={handleFormChange}
                  placeholder="e.g. Ross 308"
                  maxLength={100}
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#4b8057]"
                />
              </div>

              <div>
                <label htmlFor="placementDate" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Placement Date *
                </label>
                <input
                  id="placementDate"
                  name="placementDate"
                  type="date"
                  value={form.placementDate}
                  onChange={handleFormChange}
                  max={new Date().toISOString().slice(0, 10)}
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#4b8057]"
                />
              </div>

              <div>
                <label htmlFor="initialBirdCount" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Initial Bird Count *
                </label>
                <input
                  id="initialBirdCount"
                  name="initialBirdCount"
                  type="number"
                  min="1"
                  step="1"
                  value={form.initialBirdCount}
                  onChange={handleFormChange}
                  placeholder="e.g. 5000"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#4b8057]"
                />
              </div>

              <div>
                <label htmlFor="supplier" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Supplier / Source
                </label>
                <input
                  id="supplier"
                  name="supplier"
                  value={form.supplier}
                  onChange={handleFormChange}
                  placeholder="Supplier name"
                  maxLength={150}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#4b8057]"
                />
              </div>

              <div>
                <label htmlFor="poultryHouseId" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Poultry House *
                </label>
                <select
                  id="poultryHouseId"
                  name="poultryHouseId"
                  value={form.poultryHouseId}
                  onChange={handleFormChange}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#4b8057]"
                >
                  <option value="">Select a poultry house</option>
                  {houses
                    .filter(
                      (house) =>
                        house.status === "ACTIVE" ||
                        house.id === Number(form.poultryHouseId)
                    )
                    .map((house) => (
                      <option key={house.id} value={house.id}>
                        {house.houseNumber} — {house.name}
                      </option>
                    ))}
                </select>
                {houses.filter((house) => house.status === "ACTIVE").length === 0 && (
                  <p className="mt-1 text-xs text-amber-700">
                    Register an active poultry house before adding a flock.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Flock Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#4b8057]"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => setShowFlockForm(false)}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || houses.filter((house) => house.status === "ACTIVE").length === 0}
                className="rounded-xl bg-[#2f6840] px-5 py-3 text-sm font-semibold text-white hover:bg-[#245332] disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Save Changes"
                    : "Register Flock"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-[#e5e9df] bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#254d32]">
              Flock Directory
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {filteredFlocks.length} of {flocks.length} flocks
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search flocks..."
              aria-label="Search flocks"
              className="min-w-0 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#4b8057] sm:w-64"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by flock status"
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#4b8057]"
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading flocks...
          </div>
        ) : filteredFlocks.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf4eb] text-xl">
              🐔
            </div>
            <h3 className="font-semibold text-[#254d32]">
              {flocks.length === 0 ? "No flocks registered" : "No matching flocks"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {flocks.length === 0
                ? "Register your first flock to start tracking bird populations."
                : "Try a different search term or status."}
            </p>
            {flocks.length === 0 && canCreate && (
              <button
                type="button"
                onClick={openCreateForm}
                className="mt-4 rounded-xl bg-[#2f6840] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#245332]"
              >
                + Register First Flock
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-[#f7f8f3] text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Flock</th>
                  <th className="px-5 py-4 font-semibold">Breed</th>
                  <th className="px-5 py-4 font-semibold">Poultry House</th>
                  <th className="px-5 py-4 font-semibold">Initial Birds</th>
                  <th className="px-5 py-4 font-semibold">Current Birds</th>
                  <th className="px-5 py-4 font-semibold">Deaths</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFlocks.map((flock) => {
                  const stats = statistics[flock.id] || {};
                  const house = houses.find(
                    (item) => item.id === flock.poultryHouse?.id
                  );

                  return (
                    <tr key={flock.id} className="transition hover:bg-[#fbfcf9]">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#254d32]">
                          {flock.flockReference}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {formatDate(flock.placementDate)}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {flock.breed}
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {house?.name || flock.poultryHouse?.name || "—"}
                      </td>
                      <td className="px-5 py-4 text-gray-700">
                        {Number(flock.initialBirdCount || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 font-semibold text-[#254d32]">
                        {Number(
                          stats.currentBirdCount ?? flock.initialBirdCount ?? 0
                        ).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {Number(stats.totalDeaths || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[flock.status] ||
                            "bg-gray-100 text-gray-600"
                            }`}
                        >
                          {flock.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openFlockDetails(flock)}
                            className="rounded-lg px-3 py-2 font-semibold text-[#2f6840] hover:bg-[#edf4eb]"
                          >
                            Details
                          </button>
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => openEditForm(flock)}
                              className="rounded-lg px-3 py-2 font-semibold text-gray-600 hover:bg-gray-100"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedFlock && (
        <section className="rounded-2xl border border-[#e5e9df] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-[#66816b]">Flock Details</p>
              <h2 className="mt-1 text-xl font-bold text-[#254d32]">
                {selectedFlock.flockReference}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {selectedFlock.breed} · Placed {formatDate(selectedFlock.placementDate)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {canCreate && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMortalityForm((current) => !current);
                    setError("");
                    setSuccess("");
                  }}
                  className="rounded-xl bg-[#2f6840] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#245332]"
                >
                  + Record Mortality
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setSelectedFlock(null);
                  setShowMortalityForm(false);
                }}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Initial Birds"
              value={Number(selectedFlock.initialBirdCount).toLocaleString()}
              detail="Birds placed"
            />
            <SummaryCard
              label="Current Birds"
              value={Number(
                statistics[selectedFlock.id]?.currentBirdCount ??
                selectedFlock.initialBirdCount
              ).toLocaleString()}
              detail="After recorded mortality"
            />
            <SummaryCard
              label="Mortality Rate"
              value={`${Number(
                statistics[selectedFlock.id]?.mortalityRate || 0
              ).toFixed(2)}%`}
              detail="Deaths ÷ initial birds"
            />
          </div>

          {showMortalityForm && canCreate && (
            <form
              onSubmit={handleMortalitySubmit}
              className="mt-6 rounded-xl border border-[#e5e9df] bg-[#fbfcf9] p-4 sm:p-5"
            >
              <h3 className="font-bold text-[#254d32]">
                Record Daily Mortality
              </h3>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <label htmlFor="mortalityDate" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Date *
                  </label>
                  <input
                    id="mortalityDate"
                    type="date"
                    value={mortalityForm.mortalityDate}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(event) =>
                      setMortalityForm((current) => ({
                        ...current,
                        mortalityDate: event.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#4b8057]"
                  />
                </div>

                <div>
                  <label htmlFor="numberOfDeaths" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Number of Deaths *
                  </label>
                  <input
                    id="numberOfDeaths"
                    type="number"
                    min="1"
                    max={Math.max(
                      0,
                      Number(
                        statistics[selectedFlock.id]?.currentBirdCount ??
                        selectedFlock.initialBirdCount
                      )
                    )}
                    step="1"
                    value={mortalityForm.numberOfDeaths}
                    onChange={(event) =>
                      setMortalityForm((current) => ({
                        ...current,
                        numberOfDeaths: event.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#4b8057]"
                  />
                </div>

                <div>
                  <label htmlFor="reason" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Reason *
                  </label>
                  <select
                    id="reason"
                    value={mortalityForm.reason}
                    onChange={(event) =>
                      setMortalityForm((current) => ({
                        ...current,
                        reason: event.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#4b8057]"
                  >
                    <option value="UNKNOWN">Unknown</option>
                    <option value="DISEASE">Disease</option>
                    <option value="INJURY">Injury</option>
                    <option value="HEAT_STRESS">Heat stress</option>
                    <option value="WEAK_CHICK">Weak chick</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <input
                    id="notes"
                    value={mortalityForm.notes}
                    maxLength={500}
                    onChange={(event) =>
                      setMortalityForm((current) => ({
                        ...current,
                        notes: event.target.value,
                      }))
                    }
                    placeholder="Optional notes"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#4b8057]"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowMortalityForm(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#2f6840] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#245332] disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Mortality"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <h3 className="font-bold text-[#254d32]">
              Mortality History
            </h3>

            {mortalityRecords.length === 0 ? (
              <p className="mt-3 rounded-xl bg-[#f7f8f3] p-4 text-sm text-gray-500">
                No mortality records have been entered for this flock.
              </p>
            ) : (
              <div className="mt-3 overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead className="bg-[#f7f8f3] text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Deaths</th>
                      <th className="px-4 py-3">Reason</th>
                      <th className="px-4 py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mortalityRecords.map((record) => (
                      <tr key={record.id}>
                        <td className="px-4 py-3">
                          {formatDate(record.mortalityDate)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#254d32]">
                          {Number(record.numberOfDeaths).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {String(record.reason).replaceAll("_", " ")}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {record.notes || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
