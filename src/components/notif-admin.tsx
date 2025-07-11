import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, X } from "lucide-react"
import { useWebsocket } from "@/store/websocket/useWebsocket"
import { toast } from "sonner"
import { useIzinStore } from "@/store/izin/useIzin"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useCookies } from "react-cookie"

export default function Notifications() {
  const [cookies] = useCookies(['authToken'])
  const token = cookies.authToken
  const {GetAllIzin} = useIzinStore();
  const {
    sendMessage,
    addMessageListener,
    removeMessageListener,
    isConnected,
  } = useWebsocket();

  const { data } = useSuspenseQuery({
    queryKey: ["get-izin"],
    queryFn: () => GetAllIzin(token),
  })
  
  const [izinList, setIzinList] = useState(data || [])
  
  const unreadCount = izinList?.filter((izin) => !izin.read).length
  
  useEffect(() => {
    setIzinList(data)
  }, [data])
  
  const handlePermission = (id: string, status: boolean) => {
    setIzinList((prevList) =>
      prevList.map((izin) =>
        izin.id === id ? { ...izin, read: true } : izin
      )
    )
    const payload = {
      type: 'handle-izin',
      payload: {
        id: id,
        status: status,
      }
    }
    if (isConnected) {
      // console.log(payload)
      sendMessage(JSON.stringify(payload));
      setIzinList((prev) => prev.filter((notification) => notification.id !== id))
    }
  }

  useEffect(() => {
    const handleMessage = (data: string) => {
      const { type, payload } = JSON.parse(data);

      if (type === 'izin-masuk') {
        toast.info("izin baru masuk oleh Guru " + payload.guru);
        setIzinList((prev) => [payload, ...prev])
      }
    };

    addMessageListener(handleMessage);

    return () => {
      removeMessageListener(handleMessage);
    };
  }, []);

  const markAllAsRead = () => {
    // setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="shadow-none border-0">
          <CardHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Notifications</CardTitle>
                <CardDescription>
                  {unreadCount > 0
                    ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                    : "All caught up!"}
                </CardDescription>
              </div>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                  Mark all read
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {izinList?.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                izinList?.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors ${!notification.read ? "bg-blue-50/50" : ""
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notification.read ? "bg-gray-300" : "bg-blue-500"
                          }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <p
                                className={`text-sm font-medium ${!notification.read ? "text-gray-900" : "text-gray-600"
                                }`}
                                >
                                {notification.guru}
                              </p>
                              <Badge variant="default">{notification.jam_izin}</Badge>
                              {/* <p
                                className={`text-sm font-medium ${!notification.read ? "text-gray-900" : "text-gray-600"
                                }`}
                                >
                                {notification.jam_izin}
                              </p> */}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notification.pesan}</p>
                            <p className="text-xs text-muted-foreground mt-2">{notification.mapel} | {notification.jam_mulai} - {notification.jam_selesai}</p>
                          </div>
                          <div className="flex gap-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePermission(notification?.id!, true)}
                                className="h-6 w-6 p-0"
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePermission(notification?.id!, false)}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
