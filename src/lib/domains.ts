import { Domain } from "./types";

export const domains: Domain[] = [
  {
    id: "data-structures",
    name: "Data Structures",
    category: "it",
    icon: "🌲",
    description: "Arrays, Trees, Graphs, Hash Maps and more",
    topics: [
      { id: "arrays", name: "Arrays", subtopics: [{ id: "sorting", name: "Sorting" }, { id: "searching", name: "Searching" }, { id: "two-pointers", name: "Two Pointers" }] },
      { id: "trees", name: "Trees", subtopics: [{ id: "bst", name: "Binary Search Tree" }, { id: "avl", name: "AVL Tree" }, { id: "traversals", name: "Tree Traversals" }] },
      { id: "graphs", name: "Graphs", subtopics: [{ id: "bfs", name: "BFS" }, { id: "dfs", name: "DFS" }, { id: "shortest-path", name: "Shortest Path" }] },
      { id: "linked-lists", name: "Linked Lists", subtopics: [{ id: "singly", name: "Singly Linked" }, { id: "doubly", name: "Doubly Linked" }] },
    ],
  },
  {
    id: "algorithms",
    name: "Algorithms",
    category: "it",
    icon: "⚡",
    description: "Dynamic Programming, Greedy, Divide & Conquer",
    topics: [
      { id: "dp", name: "Dynamic Programming", subtopics: [{ id: "memoization", name: "Memoization" }, { id: "tabulation", name: "Tabulation" }, { id: "knapsack", name: "Knapsack" }] },
      { id: "greedy", name: "Greedy Algorithms", subtopics: [{ id: "activity-selection", name: "Activity Selection" }, { id: "huffman", name: "Huffman Coding" }] },
      { id: "divide-conquer", name: "Divide & Conquer", subtopics: [{ id: "merge-sort", name: "Merge Sort" }, { id: "quick-sort", name: "Quick Sort" }] },
    ],
  },
  {
    id: "system-design",
    name: "System Design",
    category: "it",
    icon: "🏗️",
    description: "Scalability, Load Balancing, Caching",
    topics: [
      { id: "scalability", name: "Scalability", subtopics: [{ id: "horizontal", name: "Horizontal Scaling" }, { id: "vertical", name: "Vertical Scaling" }] },
      { id: "databases-design", name: "Database Design", subtopics: [{ id: "sql-nosql", name: "SQL vs NoSQL" }, { id: "sharding", name: "Sharding" }] },
    ],
  },
  {
    id: "operating-systems",
    name: "Operating Systems",
    category: "it",
    icon: "🖥️",
    description: "Processes, Threads, Memory Management",
    topics: [
      { id: "processes", name: "Process Management", subtopics: [{ id: "scheduling", name: "CPU Scheduling" }, { id: "deadlock", name: "Deadlock" }] },
      { id: "memory", name: "Memory Management", subtopics: [{ id: "paging", name: "Paging" }, { id: "segmentation", name: "Segmentation" }] },
    ],
  },
  {
    id: "computer-networks",
    name: "Computer Networks",
    category: "it",
    icon: "🌐",
    description: "TCP/IP, HTTP, DNS, Routing",
    topics: [
      { id: "protocols", name: "Network Protocols", subtopics: [{ id: "tcp-udp", name: "TCP vs UDP" }, { id: "http", name: "HTTP/HTTPS" }] },
      { id: "routing", name: "Routing", subtopics: [{ id: "ospf", name: "OSPF" }, { id: "bgp", name: "BGP" }] },
    ],
  },
  {
    id: "digital-electronics",
    name: "Digital Electronics",
    category: "core",
    icon: "🔌",
    description: "Logic Gates, Flip Flops, Counters",
    topics: [
      { id: "logic-gates", name: "Logic Gates", subtopics: [{ id: "and-or-not", name: "AND, OR, NOT" }, { id: "universal-gates", name: "Universal Gates" }] },
      { id: "flip-flops", name: "Flip Flops", subtopics: [{ id: "sr-ff", name: "SR Flip Flop" }, { id: "jk-ff", name: "JK Flip Flop" }, { id: "d-ff", name: "D Flip Flop" }] },
      { id: "counters", name: "Counters", subtopics: [{ id: "synchronous", name: "Synchronous" }, { id: "asynchronous", name: "Asynchronous" }] },
    ],
  },
  {
    id: "analog-electronics",
    name: "Analog Electronics",
    category: "core",
    icon: "📡",
    description: "Op-Amps, Transistors, Amplifiers",
    topics: [
      { id: "op-amps", name: "Operational Amplifiers", subtopics: [{ id: "inverting", name: "Inverting Amplifier" }, { id: "non-inverting", name: "Non-Inverting Amplifier" }] },
      { id: "transistors", name: "Transistors", subtopics: [{ id: "bjt", name: "BJT" }, { id: "mosfet", name: "MOSFET" }] },
    ],
  },
  {
    id: "embedded-systems",
    name: "Embedded Systems",
    category: "core",
    icon: "🤖",
    description: "Microcontrollers, RTOS, Interfaces",
    topics: [
      { id: "microcontrollers", name: "Microcontrollers", subtopics: [{ id: "gpio", name: "GPIO" }, { id: "interrupts", name: "Interrupts" }] },
      { id: "communication", name: "Communication Protocols", subtopics: [{ id: "spi", name: "SPI" }, { id: "i2c", name: "I2C" }, { id: "uart", name: "UART" }] },
    ],
  },
  {
    id: "control-systems",
    name: "Control Systems",
    category: "core",
    icon: "🎛️",
    description: "Transfer Functions, Stability, PID",
    topics: [
      { id: "transfer-functions", name: "Transfer Functions", subtopics: [{ id: "poles-zeros", name: "Poles & Zeros" }, { id: "block-diagrams", name: "Block Diagrams" }] },
      { id: "stability", name: "Stability Analysis", subtopics: [{ id: "routh", name: "Routh-Hurwitz" }, { id: "nyquist", name: "Nyquist Criterion" }] },
    ],
  },
  {
    id: "signals-systems",
    name: "Signals & Systems",
    category: "core",
    icon: "📊",
    description: "Fourier, Laplace, Z-Transform",
    topics: [
      { id: "transforms", name: "Transforms", subtopics: [{ id: "fourier", name: "Fourier Transform" }, { id: "laplace", name: "Laplace Transform" }] },
      { id: "filtering", name: "Filtering", subtopics: [{ id: "low-pass", name: "Low Pass Filter" }, { id: "high-pass", name: "High Pass Filter" }] },
    ],
  },
  {
    id: "vlsi",
    name: "VLSI Design",
    category: "core",
    icon: "🔬",
    description: "CMOS, Layout Design, Verification",
    topics: [
      { id: "cmos", name: "CMOS Technology", subtopics: [{ id: "cmos-logic", name: "CMOS Logic" }, { id: "cmos-inverter", name: "CMOS Inverter" }] },
      { id: "layout", name: "Physical Design", subtopics: [{ id: "floorplanning", name: "Floorplanning" }, { id: "routing", name: "Routing" }] },
      { id: "verification", name: "Verification", subtopics: [{ id: "timing-analysis", name: "Timing Analysis" }, { id: "drc-lvs", name: "DRC & LVS" }] },
    ],
  },
  {
    id: "iot",
    name: "Internet of Things",
    category: "core",
    icon: "📶",
    description: "Sensors, Protocols, Edge Computing",
    topics: [
      { id: "sensors", name: "Sensors & Actuators", subtopics: [{ id: "temp-sensors", name: "Temperature Sensors" }, { id: "motion-sensors", name: "Motion Sensors" }] },
      { id: "iot-protocols", name: "IoT Protocols", subtopics: [{ id: "mqtt", name: "MQTT" }, { id: "coap", name: "CoAP" }, { id: "lorawan", name: "LoRaWAN" }] },
      { id: "edge-computing", name: "Edge Computing", subtopics: [{ id: "fog-computing", name: "Fog Computing" }, { id: "edge-ai", name: "Edge AI" }] },
    ],
  },
];
