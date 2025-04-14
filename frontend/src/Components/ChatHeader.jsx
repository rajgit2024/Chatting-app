import { useState } from "react"
import { Info, MoreVertical, Phone, Video, Users } from "lucide-react"
import useMobile  from "../Hooks/UseMobile"

// Custom Avatar Component
function Avatar({ src, alt, fallback, className }) {
  return (
    <div className={`relative rounded-full overflow-hidden bg-gray-200 text-white flex items-center justify-center ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="object-cover w-full h-full" />
      ) : (
        fallback
      )}
    </div>
  )
}

// Custom Icon Button
function IconButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-full text-gray-600 hover:text-blue-600 hover:bg-blue-100 transition"
    >
      {children}
    </button>
  )
}

// Custom Modal
function Modal({ open, onClose, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-red-500">✕</button>
        {children}
      </div>
    </div>
  )
}

// DropdownMenu Replacement
function Dropdown({ items }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <IconButton onClick={() => setOpen(!open)}>
        <MoreVertical className="h-5 w-5" />
      </IconButton>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md z-10">
          {items.map((item, idx) => (
            <div key={idx} onClick={item.onClick} className="px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer">
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ChatHeader({chat}) {
  const [infoOpen, setInfoOpen] = useState(false)
  const isMobile = useMobile()

  return (
    <div className="border-b p-3 flex items-center justify-between bg-white shadow-sm">
      <div className="flex items-center">
        <Avatar
          src={"/placeholder.svg?height=36&width=36"}
          alt={chat.name}
          fallback={chat.isGroup ? <Users className="h-5 w-5" /> : chat.name.substring(0, 2).toUpperCase()}
          className="h-9 w-9 mr-3 ring-2 ring-blue-500"
        />
        <div>
          <h2 className="font-medium text-gray-800">{chat.name}</h2>
          <p className="text-xs text-gray-500">{chat.isGroup ? `${chat.members.length} members` : "Online"}</p>
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <IconButton>
          <Phone className="h-5 w-5" />
        </IconButton>
        <IconButton>
          <Video className="h-5 w-5" />
        </IconButton>
        <IconButton onClick={() => setInfoOpen(true)}>
          <Info className="h-5 w-5" />
        </IconButton>
        <Dropdown
          items={[
            { label: "Search in chat", onClick: () => {} },
            { label: "Mute notifications", onClick: () => {} },
            ...(chat.isGroup ? [{ label: "Leave group", onClick: () => {} }] : []),
            { label: "Delete chat", onClick: () => {} },
          ]}
        />
      </div>

      <Modal open={infoOpen} onClose={() => setInfoOpen(false)}>
        <div className="text-center">
          <Avatar
            src={"/placeholder.svg?height=96&width=96"}
            alt={chat.name}
            fallback={chat.isGroup ? <Users className="h-12 w-12" /> : chat.name.substring(0, 2).toUpperCase()}
            className="h-24 w-24 mb-4 mx-auto"
          />
          <h3 className="text-xl font-bold">{chat.name}</h3>
          {!chat.isGroup && <p className="text-gray-500">Online</p>}
        </div>

        {chat.isGroup && (
          <div className="py-4">
            <h4 className="font-medium mb-2">Members ({chat.members.length})</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {chat.members.map((member) => (
                <div key={member.id} className="flex items-center p-2 rounded-lg hover:bg-gray-100">
                  <Avatar
                    src={member.profilePic || "/placeholder.svg"}
                    alt={member.name}
                    fallback={member.name.substring(0, 2).toUpperCase()}
                    className="h-8 w-8 mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{member.name}</p>
                    {member.isAdmin && <p className="text-xs text-gray-500">Admin</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
