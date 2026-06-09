import "./App.css";
import Card from "./components/Card";
import AddCard from "./components/AddCard";
import Footer from "./components/Footer";
import User from "./components/User";
import Notification from "./components/Notification";
import SortCards from "./components/SortCards";
import { useState, useMemo, useCallback, useEffect } from "react";
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
    pagetype: "Generative-AI",
  },
];

const SORT_FILTERS = [
  "WebPage",
  "Tool",
  "AI",
  "Multimedia",
  "Games",
  "Blogs",
  "D-Link",
  "Private",
];

function App() {
  const [storedData, setStoredData] = useState(() => {
    const saved = localStorage.getItem("websiteData");
    return saved ? JSON.parse(saved) : DEFAULT_DATA;
  });
  const [sortDisplay, setSortDisplay] = useState(false);
  const [sortType, setSortType] = useState("WebPage");
  const [submit, setSubmit] = useState(false);
  const [del, setDel] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [user, setUser] = useState(() => localStorage.getItem("imuser"));
  const [isDraggable, setIsDraggable] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Keyboard navigation for filters
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input or textarea
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

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
  }, [sortType]);

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
      localStorage.setItem("websiteData", JSON.stringify(newData));
      setStoredData(newData);
    }
  };

  const refresh = useCallback(() => {
    user === null ? setSubmit(true) : setSubmit(false);
    const saved = localStorage.getItem("websiteData");
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

  const filteredData = useMemo(() => {
    return storedData.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.url.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSort = sortType === "WebPage" || item.pagetype === sortType;
      
      return matchesSearch && matchesSort;
    });
  }, [storedData, searchQuery, sortType]);

  const sortableItems = useMemo(() => filteredData.map((item) => item.url), [filteredData]);

  return (
    <div className="App">
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
              pagetype={item.pagetype}
              sortType={sortType}
              del={del}
              isEditMode={isEditMode}
              data={storedData}
              refresh={refresh}
              notify={pushNotification}
              isDraggable={isDraggable}
            />
          ))}
        </SortableContext>
      </DndContext>
      <AddCard data={storedData} refresh={refresh} notify={pushNotification} />
      <Footer
        setv={setSubmit}
        del={setDel}
        refresh={refresh}
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
      />
      <User
        setSubmit={setSubmit}
        submit={submit}
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
    </div>
  );
}

export default App;
