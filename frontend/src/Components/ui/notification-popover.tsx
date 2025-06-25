"use client";

import { useState, useRef, useEffect, RefObject } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import axios, { AxiosResponse } from "axios";

const useOnClickOutside = (
  ref: RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

export type Notification = {
  id: string;
  data: {
    title: string;
    description: string;
  };
  created_at: string;
  read_at: string | null;
  link: string | null;
};

interface NotificationItemProps {
  notification: Notification;
  index: number;
  onMarkAsRead: (id: string) => void;
  textColor?: string;
  hoverBgColor?: string;
  dotColor?: string;
}

const NotificationItem = ({
  notification,
  index,
  onMarkAsRead,
  textColor = "text-white",
  dotColor = "bg-white",
  hoverBgColor = "hover:bg-[#ffffff37]",
}: NotificationItemProps) => (
  <motion.div
    initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
    key={notification.id}
    className={cn(`p-4 ${hoverBgColor} cursor-pointer transition-colors`)}
    onClick={() => onMarkAsRead(notification.id)}
  >
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-2">
        {!notification.read_at && (
          <span className={`h-1 w-1 rounded-full ${dotColor}`} />
        )}
        <h4 className={`text-sm font-medium ${textColor}`}>
          {notification.data.title}
        </h4>
      </div>

      <span className={`text-xs opacity-80 ${textColor}`}>
        {new Date(notification.created_at).toLocaleDateString()}
      </span>
    </div>
    <p className={`text-xs opacity-70 mt-1 ${textColor}`}>
      {notification.data.description}
    </p>
  </motion.div>
);

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  textColor?: string;
  hoverBgColor?: string;
  dividerColor?: string;
}

const NotificationList = ({
  notifications,
  onMarkAsRead,
  textColor,
  hoverBgColor,
  dividerColor = "divide-gray-200/40",
}: NotificationListProps) => (
  <div className={`divide-y ${dividerColor}`}>
    {notifications.map((notification, index) => (
      <NotificationItem
        key={notification.id}
        notification={notification}
        index={index}
        onMarkAsRead={onMarkAsRead}
        textColor={textColor}
        hoverBgColor={hoverBgColor}
      />
    ))}
  </div>
);

interface NotificationPopoverProps {
  buttonClassName?: string;
  popoverClassName?: string;
  textColor?: string;
  hoverBgColor?: string;
  dividerColor?: string;
  headerBorderColor?: string;
}

export const NotificationPopover = ({
  buttonClassName = "w-10 h-10 rounded-xl bg-transparent hover:bg-transparent",
  popoverClassName = "bg-[#11111198] backdrop-blur-sm",
  textColor = "text-white",
  hoverBgColor = "hover:bg-[#ffffff37]",
  dividerColor = "divide-gray-200/40",
  headerBorderColor = "border-gray-200/50",
}: NotificationPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => 
      axios.get('/api/notifications', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` ?? ''
        }
      })
        .then((res: AxiosResponse<Notification[]>) => res.data),
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => 
      axios.patch(`/api/notifications/${id}/read`, {}, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` ?? ''
        }
      }),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      const notification = notifications.find(n => n.id === id);
      if (notification?.link) {
        window.location.href = notification.link;
      }
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => 
      axios.post('/api/notifications/mark-all-as-read', {}, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` ?? ''
        }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  useOnClickOutside(popoverRef, () => setIsOpen(false));

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div ref={popoverRef} className={`relative ${textColor}`}>
      <Button
        onClick={toggleOpen}
        size="icon"
        className={cn("relative", buttonClassName)}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center text-xs border border-gray-800 text-white">
            {unreadCount}
          </div>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute top-0 left-full ml-2 w-80 max-h-[400px] overflow-y-auto rounded-xl shadow-lg z-50",
              popoverClassName
            )}
          >
            <div
              className={`p-4 border-b ${headerBorderColor} flex justify-between items-center`}
            >
              <h3 className="text-sm font-medium">Notifications</h3>
              <Button
                onClick={() => markAllAsReadMutation.mutate()}
                variant="ghost"
                size="sm"
                disabled={markAllAsReadMutation.isPending}
                className={`text-xs ${hoverBgColor} hover:text-white`}
              >
                Mark all as read
              </Button>
            </div>

            <NotificationList
              notifications={notifications}
              onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
              textColor={textColor}
              hoverBgColor={hoverBgColor}
              dividerColor={dividerColor}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};