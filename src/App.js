import "./App.css";
import Card from "./components/Card";
import AddCard from "./components/AddCard";
import Footer from "./components/Footer";
import NavBar from "./components/NavBar";
import UserIdentity from "./components/UserIdentity";
import Notification from "./components/Notification";
import SortCards from "./components/SortCards";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import ShortcutsModal from "./components/ShortcutsModal";
import { SORT_FILTERS } from "./constants";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

const DEFAULT_DATA = [
  {
    name: "Chat GPT",
    url: "https://chatgpt.com/",
    iconUrl: "https://chatgpt.com//favicon.ico",
    color: "#1e1e1e",
    category: "Generative-AI",
  },
];

function App() {
  const [storedData, setStoredData] = useState(() => {
    const saved = localStorage.getItem("saved_links_data");
    return saved ? JSON.parse(saved) : DEFAULT_DATA;
  });
  const [sortDisplay, setSortDisplay] = useState(false);
  const [sortType, setSortType] = useState("WebPage");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [user, setUser] = useState(() => localStorage.getItem("user_nickname"));
  const [isDraggable, setIsDraggable] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [importVisible, setImportVisible] = useState(false);
  const [exportVisible, setExportVisible] = useState(false);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  const searchInputRef = useRef(null);

  const refreshData = useCallback(() => {
    user === null ? setIsUserModalOpen(true) : setIsUserModalOpen(false);
    const saved = localStorage.getItem("saved_links_data");
    setStoredData(saved ? JSON.parse(saved) : DEFAULT_DATA);
  }, [user]);

  // ── Notification queue ──
  const [notifQueue, setNotifQueue] = useState([]);

  const pushNotification = useCallback((message, color) => {
    const id = Date.now() + Math.random(); // unique key
    setNotifQueue((prev) => [...prev, { id, message, color }]);
    // auto-remove after animation finishes (~4 s)
    setTimeout(() => {
      setNotifQueue((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifQueue((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // ── Online/Offline status monitoring ──
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      pushNotification("Back online!", "#1dff77");
    };
    const handleOffline = () => {
      setIsOnline(false);
      pushNotification("You are working offline", "#ffaa00");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [pushNotification]);

  // Keyboard navigation for filters and more
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input or textarea
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        if (e.key === "Escape") {
          e.target.blur();
        }
        return;
      }

      if (e.key === "?") {
        setIsShortcutsModalOpen((prev) => !prev);
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (e.key === "s" || e.key === "S") {
        setSortType("WebPage");
        return;
      }

      if (e.key === "e" || e.key === "E") {
        const nextEditMode = !isEditMode;
        setIsEditMode(nextEditMode);
        if (nextEditMode && isDeleteMode) setIsDeleteMode(false);
        pushNotification(
          nextEditMode ? "Edit mode on" : "Edit mode off",
          nextEditMode ? "#4fc3f7" : "#1e1e1e"
        );
        return;
      }

      if (e.key === "t" || e.key === "T") {
        const nextDeleteMode = !isDeleteMode;
        setIsDeleteMode(nextDeleteMode);
        if (nextDeleteMode && isEditMode) setIsEditMode(false);
        pushNotification(
          nextDeleteMode ? "Trash mode on" : "Trash mode off",
          nextDeleteMode ? "red" : "#1e1e1e"
        );
        return;
      }

      if (e.key === "r" || e.key === "R") {
        const nextDraggable = !isDraggable;
        setIsDraggable(nextDraggable);
        pushNotification(
          nextDraggable ? "Dragging enabled" : "Dragging disabled",
          nextDraggable ? "#1dff77" : "#1e1e1e"
        );
        return;
      }

      if (e.key === "i" || e.key === "I") {
        setImportVisible(true);
        return;
      }

      if (e.key === "x" || e.key === "X") {
        setExportVisible(true);
        return;
      }

      const currentIndex = SORT_FILTERS.indexOf(sortType);
      let nextIndex = currentIndex;

      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : SORT_FILTERS.length - 1;
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        nextIndex = currentIndex < SORT_FILTERS.length - 1 ? currentIndex + 1 : 0;
      }

      if (nextIndex !== currentIndex) {
        setSortType(SORT_FILTERS[nextIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sortType, isEditMode, isDeleteMode, isDraggable, pushNotification]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      const oldIndex = storedData.findIndex((item) => item.url === active.id);
      const newIndex = storedData.findIndex((item) => item.url === over.id);

      const newData = arrayMove(storedData, oldIndex, newIndex);
      localStorage.setItem("saved_links_data", JSON.stringify(newData));
      setStoredData(newData);
    }
  };

  const filteredData = useMemo(() => {
    return storedData.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.url.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSort = sortType === "WebPage" || item.category === sortType;
      
      return matchesSearch && matchesSort;
    });
  }, [storedData, searchQuery, sortType]);

  const sortableItems = useMemo(() => filteredData.map((item) => item.url), [filteredData]);

  return (
    <div className="App">
      <NavBar
        setIsUserModalOpen={setIsUserModalOpen}
        setIsDeleteMode={setIsDeleteMode}
        refreshData={refreshData}
        user={user}
        notify={pushNotification}
        setSortDisplay={setSortDisplay}
        isDraggable={isDraggable}
        setIsDraggable={setIsDraggable}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        sortType={sortType}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setIsShortcutsModalOpen={setIsShortcutsModalOpen}
        setImportVisible={setImportVisible}
        setExportVisible={setExportVisible}
        importVisible={importVisible}
        exportVisible={exportVisible}
        isDeleteMode={isDeleteMode}
        searchInputRef={searchInputRef}
        setSortType={setSortType}
        isOnline={isOnline}
      />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sortableItems} strategy={rectSortingStrategy}>
          {filteredData.map((item) => (
            <Card
              key={item.url}
              id={item.url}
              name={item.name}
              url={item.url}
              iconUrl={item.iconUrl}
              color={item.color}
              category={item.category}
              sortType={sortType}
              isDeleteMode={isDeleteMode}
              isEditMode={isEditMode}
              data={storedData}
              refreshData={refreshData}
              notify={pushNotification}
              isDraggable={isDraggable}
            />
          ))}
        </SortableContext>
      </DndContext>
      <AddCard data={storedData} refreshData={refreshData} notify={pushNotification} />
      <Footer />
      <UserIdentity
        setIsUserModalOpen={setIsUserModalOpen}
        isUserModalOpen={isUserModalOpen}
        setUser={setUser}
        notify={pushNotification}
      />
      <Notification
        queue={notifQueue}
        dismiss={dismissNotification}
      />
      <SortCards
        sortDisplay={sortDisplay}
        setSortDisplay={setSortDisplay}
        sortType={sortType}
        setSortType={setSortType}
      />
      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </div>
  );
}

export default App;
