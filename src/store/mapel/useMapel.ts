import { create } from "zustand";
import { fetchServer } from "@/lib/fetchServer";
import { urlBuilder } from "@/lib/utils";
import type { MapelStore } from "./types";

export const useMapelStore = create<MapelStore>((set, get) => ({
    list: [],
    default: { jurusan_id: "", name: "" },
    model: { jurusan_id: "", name: "" },
    loading: false,

    tableAttributes: [
        {
            accessorKey: "jurusan.name",
            header: "Jurusan",
        },
        {
            accessorKey: "name",
            header: "Nama Mapel",
        },
    ],

    setModel(model) {
        const currentModel = get().model;
        const newModel = model || get().default;
        if (JSON.stringify(currentModel) !== JSON.stringify(newModel)) {
            set({ model: newModel });
        }
    },

    RegisterMapel: async (token, payload) => {
        set({ loading: true });
        try {
            const response = await fetchServer(token, urlBuilder('/mapel'), {
                method: payload.id ? 'PUT' : 'POST',
                body: payload,
            });

            console.log(response.data);

            return response.data;
        } catch (error) {
            console.error('Error registering mapel:', error);
            return error;
        } finally {
            set({ loading: false });
        }
    },

    GetAllMapel: async (token) => {
        set({ loading: true });
        try {
            const response = await fetchServer(token, urlBuilder('/mapel'), {
                method: 'GET',
            });

            const data = await response.data;
            set({ list: data?.data! || [] });

            return data?.data! || [];
        } catch (error) {
            console.error('Error getting list of mapel:', error);
            return error;
        } finally {
            set({ loading: false });
        }
    },

    GetMapelById: async (token, id) => {
        set({ loading: true });
        try {
            const response = await fetchServer(token, urlBuilder(`/mapel/${id}`), {
                method: 'GET',
            });

            const data = await response.data;

            return data;
        } catch (error) {
            console.error('Error getting list of mapel:', error);
            return error;
        } finally {
            set({ loading: false });
        }
    },
}));
