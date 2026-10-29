
import { useEffect, useState } from "react";
import {
  createPoultryHouse,
  getPoultryHouses,
  updatePoultryHouse,
} from "../api/poultryHouseService";

const EMPTY_FORM = {
  houseNumber: "",
  name: "",
  farmSite: "",
  capacity: "",
  houseType: "BROILER",
  status: "ACTIVE",
  description: "",
};

const STATUS_STYLES = {
  ACTIVE: "bg-green-100 text-green-800",
  MAINTENANCE: "bg-amber-100 text-amber-800",
  INACTIVE: "bg-gray-100 text-gray-600",
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

export default function PoultryHouses() {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  async function loadHouses() {
    setLoading(true);
    setError("");

    try {
      const data = await getPoultryHouses();
      setHouses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load poultry houses.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function fetchHouses() {
      try {
        const data = await getPoultryHouses();
        if (!cancelled) {
          setHouses(Array.isArray(data) ? data : []);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load poultry houses.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchHouses();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredHouses = houses.filter((house) => {
    const query = search.trim().toLowerCase();

    const matchesSearch = [
      house.houseNumber,
      house.name,
      house.farmSite,
      house.houseType,
    ].some((value) => String(value || "").toLowerCase().includes(query));

    const matchesStatus =
      statusFilter === "ALL" || house.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCapacity = houses.reduce(
    (total, house) => total + Number(house.capacity || 0),
    0
  );

  const activeHouses = houses.filter(
    (house) => house.status === "ACTIVE"
  ).length;

  const maintenanceHouses = houses.filter(
    (house) => house.status === "MAINTENANCE"
  ).length;

  function openCreateForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  }

  function openEditForm(house) {
    setEditingId(house.id);
    setForm({
      houseNumber: house.houseNumber || "",
      name: house.name || "",
      farmSite: house.farmSite || "",
      capacity: String(house.capacity ?? ""),
      houseType: house.houseType || "BROILER",
      status: house.status || "ACTIVE",
      description: house.description || "",
    });
    setError("");
    setShowForm(true);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      houseNumber: form.houseNumber.trim(),
      name: form.name.trim(),
      farmSite: form.farmSite.trim(),
      capacity: Number(form.capacity),
      houseType: form.houseType,
      status: form.status,
      description: form.description.trim(),
    };

    try {
      if (editingId !== null) {
        await updatePoultryHouse(editingId, payload);
      } else {
        await createPoultryHouse(payload);
      }

      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      await loadHouses();
    } catch (err) {
      setError(err.message || "Unable to save poultry house.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-[#66816b]">
            Farm Operations
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#254d32]">
            Poultry Houses
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage poultry houses, capacity, locations and operating status.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="rounded-xl bg-[#2f6840] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#245332]"
        >
          + Register House
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={loadHouses}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Houses"
          value={houses.length}
          detail="Registered poultry houses"
        />
        <SummaryCard
          label="Active Houses"
          value={activeHouses}
          detail="Currently operational"
        />
        <SummaryCard
          label="Under Maintenance"
          value={maintenanceHouses}
          detail="Requiring maintenance"
        />
        <SummaryCard
          label="Total Capacity"
          value={totalCapacity.toLocaleString()}
          detail="Birds across all houses"
        />
      </div>

      {showForm && (
        <section className="rounded-2xl border border-[#e5e9df] bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#254d32]">
                {editingId !== null ? "Edit Poultry House" : "Register Poultry House"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Enter the house details below.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm(EMPTY_FORM);
              }}
              className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <label htmlFor="houseNumber" className="mb-1.5 block text-sm font-medium text-gray-700">
                  House Number *
                </label>
                <input
                  id="houseNumber"
                  name="houseNumber"
                  value={form.houseNumber}
                  onChange={handleChange}
                  placeholder="e.g. PH-001"
                  maxLength={50}
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#4b8057] focus:ring-2 focus:ring-[#4b8057]/20"
                />
              </div>

              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
                  House Name *
                </label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Broiler House A"
                  maxLength={100}
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#4b8057] focus:ring-2 focus:ring-[#4b8057]/20"
                />
              </div>

              <div>
                <label htmlFor="farmSite" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Farm Site
                </label>
                <input
                  id="farmSite"
                  name="farmSite"
                  value={form.farmSite}
                  onChange={handleChange}
                  placeholder="e.g. Main Farm"
                  maxLength={100}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#4b8057] focus:ring-2 focus:ring-[#4b8057]/20"
                />
              </div>

              <div>
                <label htmlFor="capacity" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Maximum Bird Capacity *
                </label>
                <input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  step="1"
                  value={form.capacity}
                  onChange={handleChange}
                  placeholder="e.g. 5000"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#4b8057] focus:ring-2 focus:ring-[#4b8057]/20"
                />
              </div>

              <div>
                <label htmlFor="houseType" className="mb-1.5 block text-sm font-medium text-gray-700">
                  House Type *
                </label>
                <select
                  id="houseType"
                  name="houseType"
                  value={form.houseType}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#4b8057]"
                >
                  <option value="BROILER">Broiler</option>
                  <option value="LAYER">Layer</option>
                  <option value="BREEDER">Breeder</option>
                  <option value="BROODER">Brooder</option>
                  <option value="GROWER">Grower</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#4b8057]"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="md:col-span-2 xl:col-span-3">
                <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Description / Notes
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  maxLength={500}
                  placeholder="Additional details about this house..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#4b8057] focus:ring-2 focus:ring-[#4b8057]/20"
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(EMPTY_FORM);
                }}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#2f6840] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#245332] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Save Changes"
                    : "Register House"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-[#e5e9df] bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#254d32]">
              House Directory
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {filteredHouses.length} of {houses.length} houses
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search houses..."
              aria-label="Search poultry houses"
              className="min-w-0 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#4b8057] sm:w-64"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by house status"
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#4b8057]"
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading poultry houses...
          </div>
        ) : filteredHouses.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf4eb] text-xl">
              🐔
            </div>
            <h3 className="font-semibold text-[#254d32]">
              {houses.length === 0 ? "No poultry houses registered" : "No matching houses"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {houses.length === 0
                ? "Register your first poultry house to get started."
                : "Try another search term or status filter."}
            </p>
            {houses.length === 0 && (
              <button
                type="button"
                onClick={openCreateForm}
                className="mt-4 rounded-xl bg-[#2f6840] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#245332]"
              >
                + Register First House
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[#f7f8f3] text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">House</th>
                  <th className="px-5 py-4 font-semibold">Farm Site</th>
                  <th className="px-5 py-4 font-semibold">Type</th>
                  <th className="px-5 py-4 font-semibold">Capacity</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredHouses.map((house) => (
                  <tr key={house.id} className="transition hover:bg-[#fbfcf9]">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#254d32]">
                        {house.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {house.houseNumber}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {house.farmSite || "—"}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {house.houseType}
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-700">
                      {Number(house.capacity || 0).toLocaleString()} birds
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          STATUS_STYLES[house.status] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {String(house.status || "UNKNOWN").replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openEditForm(house)}
                        className="rounded-lg px-3 py-2 font-semibold text-[#2f6840] hover:bg-[#edf4eb]"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
