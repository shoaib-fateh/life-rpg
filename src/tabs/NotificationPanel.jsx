const NotificationPanel = ({
  notifications,
  unreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
}) => (
  <div className="p-4 animate-fade-in">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-purple-400 drop-shadow-glow">Notifications</h2>
      {unreadNotifications > 0 && (
        <button
          onClick={markAllNotificationsAsRead}
          className="text-sm bg-purple-700 px-3 py-1 rounded hover:bg-purple-600 transition"
        >
          Mark all as read
        </button>
      )}
    </div>

    {notifications.length === 0 ? (
      <div className="text-center py-10 text-gray-400">No notifications yet</div>
    ) : (
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {[...notifications].reverse().map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border ${
              notification.read
                ? "bg-gray-800 border-gray-700"
                : "bg-gray-900 border-purple-500"
            } backdrop-blur-md`}
          >
            <div className="flex justify-between">
              <div className="flex items-start">
                {notification.type === "level" && <span className="mr-2 text-yellow-400">🌟</span>}
                {notification.type === "achievement" && <span className="mr-2 text-green-400">🏆</span>}
                {notification.type === "penalty" && <span className="mr-2 text-red-400">⚠️</span>}
                <div>
                  <p className={notification.read ? "text-gray-300" : "text-white"}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              {!notification.read && (
                <button
                  onClick={() => markNotificationAsRead(notification.id)}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Mark read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default NotificationPanel;
