import { createFileRoute } from '@tanstack/react-router'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, CircleX, Loader2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

import { DataTable } from '@/components/data-table/table'
import { DefineColumns } from '@/components/data-table/columns'
import { toast } from 'sonner'
import { useCookies } from 'react-cookie'

import { useKelasStore } from '@/store/kelas/useKelas'
import { useKetuaKelasStore } from '@/store/ketuaKelas/useKetuaKelas'
import { useJurusanStore } from '@/store/jurusan/useJurusan'

import { AutoComplete } from '@/components/autocomplete'

export const Route = createFileRoute('/_auth_guru/admin/kelas')({
  component: RouteComponent,
})

function RouteComponent() {
  const [cookies] = useCookies(['authToken'])
  const token = cookies.authToken

  const kelasStore = useKelasStore()
  const ketuaStore = useKetuaKelasStore()
  const jurusanStore = useJurusanStore()

  const [value, setValue] = useState<string>("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const columns = DefineColumns(kelasStore.tableAttributes)
  const grade = [
    {value: "X", label: "X"},
    {value: "XI", label: "XI"},
    {value: "XII", label: "XII"}
  ]

  // fetch awal
  useEffect(() => {

    const fetchData = async () => {
        await kelasStore.GetAllKelas(token)
        await ketuaStore.GetUnsignedKetuaKelas(token)
        await jurusanStore.GetAllJurusan(token)
    }
    fetchData()
    
  }, [])

  useEffect(()=> {
    if (isAddDialogOpen === false && kelasStore.model.id) {
      kelasStore.setModel()
    }
  },[isAddDialogOpen])

  const validate = () => {
    const m = kelasStore.model
    if (!m.ketua_kelas_id || !m.jurusan_id || !m.grade || !m.index) {
      toast.error('Ketua, Jurusan, Grade, dan Index wajib diisi')
      return false
    }
    return true
  }

  const handleAdd = async () => {
    if (!validate()) return
    // console.log(kelasStore.model)
    const response = await kelasStore.RegisterKelas(token, kelasStore.model)
    if (response.success) {
      await kelasStore.GetAllKelas(token)
      await ketuaStore.GetUnsignedKetuaKelas(token)
      toast.success('Kelas berhasil ditambahkan')
      kelasStore.setModel()
      setValue("")
      setIsAddDialogOpen(false)
    } else {
      toast.error(response.message)
    }
  }

  const handleUpdate = async (data: any) => {
    console.log(data)
    setIsAddDialogOpen(true)
    kelasStore.setModel({
      id: data.id,
      name: data.name,
      jurusan_id: data.jurusan.id,
      ketua_kelas_id: data.ketua_kelas.id,
    })
  }

  const handlechangeIndex = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, "") // hanya angka
    kelasStore.setModel({
      ...kelasStore.model,
      index: inputValue === "" ? "" : Number(inputValue), // kosongkan jika kosong, atau ubah ke number
    })
  }
  

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <div className="space-y-6">
        {/* Header + tombol Add */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Kelas</h1>
            <p className="text-muted-foreground">Manage data Kelas</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                disabled={kelasStore.loading || ketuaStore.loading}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90">
                  {kelasStore.loading || ketuaStore.loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ):(
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                Tambah Kelas
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] border border-primary/20 shadow-lg">
              <DialogHeader className="bg-gradient-to-r from-primary/10 to-accent/10 -mx-6 -mt-6 px-6 pt-6 pb-4 border-b">
                <DialogTitle>{kelasStore.model.id ? 'Update' : 'Tambah'} Kelas</DialogTitle>
                <DialogDescription>{kelasStore.model.id ? 'Update' : 'Tambah'} Data Kelas</DialogDescription>
                {/* <DialogTitle>Tambah Kelas</DialogTitle>
                <DialogDescription>Isi data Kelas baru</DialogDescription> */}
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4 overflow-x-hidden">
                  <Label>Jurusan</Label>
                  <Select
                    disabled={kelasStore.loading}
                    value={kelasStore.model.jurusan_id}
                    onValueChange={value =>
                      kelasStore.setModel({ ...kelasStore.model, jurusan_id: value })
                    }
                  >
                    <SelectTrigger className="w-[16rem]">
                      <SelectValue placeholder="Pilih Jurusan" />
                    </SelectTrigger>
                    <SelectContent>
                    {jurusanStore?.list?.length == 0 && (
                        <SelectItem disabled value="null">
                          {/* <Loader2 className="mr-2 h-4 w-4 animate-spin" /> */}
                          No data
                        </SelectItem>
                      )}
                      {jurusanStore?.list?.map(j => (
                        <SelectItem key={j.id} value={j.id!}>
                          {j.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4 overflow-x-hidden">
                  <Label>Grade</Label>
                  <Select
                    disabled={kelasStore.loading}
                    value={kelasStore.model.grade}
                    onValueChange={value =>
                      kelasStore.setModel({ ...kelasStore.model, grade: value })
                    }
                  >
                    <SelectTrigger className="w-[16rem]">
                      <SelectValue placeholder="Pilih Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {grade?.map(j => (
                        <SelectItem key={j.value} value={j.value}>
                          {j.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label>Index</Label>
                  <Input
                    type="text"
                    value={kelasStore.model.index}
                    onChange={handlechangeIndex}
                    maxLength={2}
                    className="col-span-3 border-primary/20 focus:border-primary w-[20%]"
                  />
                </div>

                {/* Ketua */}
                <div className="grid grid-cols-4 items-center gap-4 overflow-x-hidden">
                  <Label>Ketua Kelas</Label>
                  <AutoComplete
                    data={ketuaStore?.unsignedList!}
                    value={value}
                    placeholder="Cari Ketua Kelas..."
                    onChange={(item) => {
                      setValue(item?.name || "")
                      kelasStore.setModel({ ...kelasStore.model, ketua_kelas_id: item?.id || "" })
                    }}
                  />
                </div>
                
              </div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    kelasStore.setModel()
                    setValue("")
                  }}
                  disabled={kelasStore.loading}
                  size="icon"
                  className="bg-red-500 hover:bg-red-600"
                >
                  <CircleX />
                </Button>
                <Button
                  onClick={handleAdd}
                  disabled={kelasStore.loading}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90"
                >
                  {kelasStore.loading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Submit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={kelasStore?.list!}
          searchKey="Nama Kelas"
          searchPlaceholder="Cari nama kelas"
          onUpdate={handleUpdate}
        />
      </div>
    </main>
  )
}
