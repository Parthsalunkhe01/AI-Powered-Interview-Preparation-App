/**
 * Question Blueprint Bank — Expanded
 * Difficulty: 1=Easy, 2=Medium, 3=Hard
 * Types: conceptual | scenario | debug | coding | dsa | system_design | database | behavioral | puzzle
 */

const QUESTION_BANK = {

  // ─── GENERAL / WARMUP ────────────────────────────────────────────
  general: [
    { id:"gen-01", category:"General", difficulty:1, type:"behavioral",
      text:"Walk me through your background and key projects you've worked on.",
      expectedConcepts:["self intro","experience","communication"],
      followUpHints:["What project are you most proud of?","What technologies excite you most?"],
      tags:["Warmup","Communication"], companyPattern:"all" },
    { id:"gen-02", category:"General", difficulty:1, type:"behavioral",
      text:"Why are you interested in this role and what do you hope to learn?",
      expectedConcepts:["motivation","career goals","role alignment"],
      followUpHints:["What specific skills do you want to develop?"],
      tags:["Warmup","Behavioral"], companyPattern:"amazon" },
    { id:"gen-03", category:"General", difficulty:2, type:"behavioral",
      text:"Describe a technically challenging problem you faced and how you solved it.",
      expectedConcepts:["problem solving","debugging","critical thinking","impact"],
      followUpHints:["What would you do differently now?","How did you measure success?"],
      tags:["Problem Solving","Behavioral"], companyPattern:"google" },
    { id:"gen-04", category:"General", difficulty:2, type:"behavioral",
      text:"Tell me about a time you disagreed with a teammate and how you handled it.",
      expectedConcepts:["conflict resolution","communication","collaboration","ownership"],
      followUpHints:["What was the final outcome?"],
      tags:["Behavioral","HR"], companyPattern:"amazon" },
    { id:"gen-05", category:"General", difficulty:1, type:"behavioral",
      text:"What is your biggest technical weakness and what are you doing to improve it?",
      expectedConcepts:["self-awareness","growth mindset","honesty"],
      followUpHints:["How long have you been working on this?"],
      tags:["HR","Behavioral"], companyPattern:"microsoft" },
  ],

  // ─── JAVA ─────────────────────────────────────────────────────────
  java: [
    { id:"java-01", category:"Java", difficulty:1, type:"conceptual",
      text:"What is the difference between an interface and an abstract class in Java?",
      expectedConcepts:["interface","abstract class","multiple inheritance","default methods","implementation"],
      followUpHints:["When would you choose an interface over an abstract class?"],
      tags:["Java","OOP"], companyPattern:"all" },
    { id:"java-02", category:"Java", difficulty:1, type:"conceptual",
      text:"Explain the final keyword in Java when applied to a variable, method, and class.",
      expectedConcepts:["final variable","final method","final class","immutability"],
      followUpHints:["What is the difference between final and static?"],
      tags:["Java","Fundamentals"], companyPattern:"all" },
    { id:"java-03", category:"Java", difficulty:2, type:"conceptual",
      text:"How does Java handle memory management and what role does the garbage collector play?",
      expectedConcepts:["heap","stack","GC","object lifecycle","memory leaks"],
      followUpHints:["What can cause a memory leak in Java even with GC?"],
      tags:["Java","Memory"], companyPattern:"google" },
    { id:"java-04", category:"Java", difficulty:2, type:"conceptual",
      text:"What is the difference between checked and unchecked exceptions? Give a real example of each.",
      expectedConcepts:["checked exception","unchecked exception","RuntimeException","IOException"],
      followUpHints:["When is it appropriate to use a custom exception?"],
      tags:["Java","Exception Handling"], companyPattern:"all" },
    { id:"java-05", category:"Java", difficulty:3, type:"conceptual",
      text:"Explain Java's memory model and how the volatile keyword works with multi-threaded access.",
      expectedConcepts:["JMM","volatile","visibility","thread safety","happens-before"],
      followUpHints:["How does volatile differ from synchronized?"],
      tags:["Java","Concurrency"], companyPattern:"google" },
    { id:"java-06", category:"Java", difficulty:2, type:"scenario",
      text:"You have a Java application that slows down significantly after running for hours. What could cause this and how would you diagnose it?",
      expectedConcepts:["memory leak","GC pressure","thread leak","profiling","heap dump"],
      followUpHints:["Which profiling tools would you use?"],
      tags:["Java","Debugging","Performance"], companyPattern:"startup" },
    { id:"java-07", category:"Java", difficulty:3, type:"coding",
      text:"Write a Java method to check if a given string is a palindrome without using a library reverse method.",
      expectedConcepts:["two pointer","charAt","loop","string manipulation"],
      followUpHints:["Can you do it in O(1) space?","Handle case-insensitive and spaces?"],
      tags:["Java","Coding"], companyPattern:"google" },
    { id:"java-08", category:"Java", difficulty:2, type:"debug",
      text:"A Java developer gets a ConcurrentModificationException while iterating a List. What is the cause and how do you fix it?",
      expectedConcepts:["ConcurrentModificationException","iterator","fail-fast","CopyOnWriteArrayList","removeIf"],
      followUpHints:["What is the difference between fail-fast and fail-safe iterators?"],
      tags:["Java","Debugging"], companyPattern:"microsoft" },
  ],

  // ─── OOP ──────────────────────────────────────────────────────────
  oop: [
    { id:"oop-01", category:"OOP", difficulty:1, type:"conceptual",
      text:"Explain the four main principles of OOP with a simple example for each.",
      expectedConcepts:["encapsulation","inheritance","polymorphism","abstraction"],
      followUpHints:["Which principle is most important in large codebases?"],
      tags:["OOP","Fundamentals"], companyPattern:"all" },
    { id:"oop-02", category:"OOP", difficulty:2, type:"conceptual",
      text:"What is polymorphism and how does runtime vs compile-time polymorphism differ in Java?",
      expectedConcepts:["method overriding","method overloading","dynamic dispatch","vtable"],
      followUpHints:["How does Java determine which method to call at runtime?"],
      tags:["OOP","Polymorphism"], companyPattern:"all" },
    { id:"oop-03", category:"OOP", difficulty:2, type:"conceptual",
      text:"What are SOLID principles? Describe one with a practical example from your experience.",
      expectedConcepts:["Single Responsibility","Open/Closed","Liskov","Interface Segregation","Dependency Inversion"],
      followUpHints:["How does violating SOLID make code harder to maintain?"],
      tags:["OOP","Design"], companyPattern:"microsoft" },
    { id:"oop-04", category:"OOP", difficulty:3, type:"scenario",
      text:"You are building a payment system that needs to support PayPal, Stripe, and future providers. How would you design it using OOP principles?",
      expectedConcepts:["strategy pattern","interface","Open/Closed","polymorphism","dependency injection"],
      followUpHints:["What design pattern does this resemble?"],
      tags:["OOP","Design Patterns","Scenario"], companyPattern:"startup" },
  ],

  // ─── DSA ──────────────────────────────────────────────────────────
  dsa: [
    { id:"dsa-01", category:"DSA", difficulty:1, type:"conceptual",
      text:"What is the difference between an Array and a LinkedList? When would you choose one over the other?",
      expectedConcepts:["random access","O(1) index","O(n) insertion","memory layout"],
      followUpHints:["Time complexity of inserting at the beginning of each?"],
      tags:["DSA","Arrays","LinkedList"], companyPattern:"google" },
    { id:"dsa-02", category:"DSA", difficulty:1, type:"conceptual",
      text:"Explain Stack and Queue with a real-world use case for each.",
      expectedConcepts:["LIFO","FIFO","call stack","print queue","browser history","undo-redo"],
      followUpHints:["How do you implement a Queue using two Stacks?"],
      tags:["DSA","Stack","Queue"], companyPattern:"all" },
    { id:"dsa-03", category:"DSA", difficulty:2, type:"conceptual",
      text:"How does a HashMap work internally? How does it handle collisions?",
      expectedConcepts:["hash function","buckets","chaining","open addressing","load factor","rehashing"],
      followUpHints:["What happens if the hash function produces the same value for all keys?"],
      tags:["DSA","HashMap"], companyPattern:"google" },
    { id:"dsa-04", category:"DSA", difficulty:2, type:"conceptual",
      text:"Explain Binary Search. Under what conditions can it be applied and what is its time complexity?",
      expectedConcepts:["sorted array","O(log n)","midpoint","divide and conquer"],
      followUpHints:["How would you apply binary search on a rotated sorted array?"],
      tags:["DSA","Searching"], companyPattern:"google" },
    { id:"dsa-05", category:"DSA", difficulty:3, type:"coding",
      text:"Describe and implement an algorithm to detect a cycle in a linked list.",
      expectedConcepts:["Floyd's algorithm","slow/fast pointer","O(1) space","cycle detection"],
      followUpHints:["How would you find the starting node of the cycle?"],
      tags:["DSA","LinkedList","Algorithms"], companyPattern:"google" },
    { id:"dsa-06", category:"DSA", difficulty:2, type:"coding",
      text:"Write a method to find the two numbers in an array that add up to a given target sum.",
      expectedConcepts:["HashMap","O(n) time","O(n) space","two-pointer","brute force comparison"],
      followUpHints:["Can you solve this in O(n) time?","What if the array is sorted?"],
      tags:["DSA","Arrays","Coding"], companyPattern:"all" },
    { id:"dsa-07", category:"DSA", difficulty:2, type:"conceptual",
      text:"What is a Binary Search Tree? What are the time complexities for insertion, deletion, and search in the average and worst case?",
      expectedConcepts:["BST","O(log n) average","O(n) worst","balanced tree","unbalanced"],
      followUpHints:["What is an AVL tree and when would you use it?"],
      tags:["DSA","Trees"], companyPattern:"google" },
    { id:"dsa-08", category:"DSA", difficulty:3, type:"conceptual",
      text:"Compare BFS and DFS. When would you use each in a real application?",
      expectedConcepts:["breadth-first","depth-first","shortest path","queue","stack","recursion","graph traversal"],
      followUpHints:["How does Dijkstra's algorithm extend BFS?"],
      tags:["DSA","Graphs","Algorithms"], companyPattern:"google" },
    { id:"dsa-09", category:"DSA", difficulty:1, type:"conceptual",
      text:"What is the difference between a sorting algorithm being stable vs unstable?",
      expectedConcepts:["stable sort","equal elements order","merge sort","quicksort","practical impact"],
      followUpHints:["Name one stable and one unstable sorting algorithm."],
      tags:["DSA","Sorting"], companyPattern:"all" },
    { id:"dsa-10", category:"DSA", difficulty:3, type:"puzzle",
      text:"You have 8 balls and one is slightly heavier. You have a balance scale and can make only 2 weighings. How do you find the heavy ball?",
      expectedConcepts:["divide and conquer","ternary split","logical elimination","3-3-2 split"],
      followUpHints:["What if you only had 1 weighing?"],
      tags:["DSA","Puzzle","Logic"], companyPattern:"google" },
  ],

  // ─── ANDROID ──────────────────────────────────────────────────────
  android: [
    { id:"android-01", category:"Android", difficulty:1, type:"conceptual",
      text:"Walk me through the Activity lifecycle and why handling it correctly matters.",
      expectedConcepts:["onCreate","onStart","onResume","onPause","onStop","onDestroy","configuration change"],
      followUpHints:["What happens to an Activity during screen rotation?"],
      tags:["Android","Lifecycle"], companyPattern:"all" },
    { id:"android-02", category:"Android", difficulty:1, type:"conceptual",
      text:"What is the difference between a Fragment and an Activity in Android?",
      expectedConcepts:["Fragment","Activity","host","backstack","reusability","FragmentManager"],
      followUpHints:["When would you prefer Fragments over multiple Activities?"],
      tags:["Android","Fundamentals"], companyPattern:"all" },
    { id:"android-03", category:"Android", difficulty:1, type:"conceptual",
      text:"What is RecyclerView and what advantages does it have over the older ListView?",
      expectedConcepts:["ViewHolder pattern","view recycling","LayoutManager","efficient scrolling","item animations"],
      followUpHints:["How does the ViewHolder pattern improve performance?"],
      tags:["Android","RecyclerView","UI"], companyPattern:"all" },
    { id:"android-04", category:"Android", difficulty:2, type:"scenario",
      text:"How would you optimize a RecyclerView that is slow when scrolling through 10,000 items?",
      expectedConcepts:["DiffUtil","pagination","image lazy loading","ViewHolder","RecycledViewPool","prefetch"],
      followUpHints:["What is the difference between notifyDataSetChanged and DiffUtil?"],
      tags:["Android","Performance","Scenario"], companyPattern:"startup" },
    { id:"android-05", category:"Android", difficulty:2, type:"debug",
      text:"Why might a RecyclerView crash with IndexOutOfBoundsException and how would you fix it?",
      expectedConcepts:["data mutation on main thread","adapter inconsistency","notifyItemRemoved","DiffUtil"],
      followUpHints:["How do you safely update adapter data from a background thread?"],
      tags:["Android","Debug","RecyclerView"], companyPattern:"startup" },
    { id:"android-06", category:"Android", difficulty:1, type:"conceptual",
      text:"What is Room and how does it simplify SQLite database access in Android?",
      expectedConcepts:["Room","DAO","Entity","Database","compile-time checks","LiveData","Flow"],
      followUpHints:["How do you handle database migrations in Room?"],
      tags:["Android","Room","Database"], companyPattern:"all" },
    { id:"android-07", category:"Android", difficulty:2, type:"conceptual",
      text:"What is Retrofit and how does it handle converting JSON responses to Java objects?",
      expectedConcepts:["Retrofit","HTTP client","REST API","Gson/Moshi","annotation","Converter"],
      followUpHints:["How do you add authentication headers to every Retrofit request?"],
      tags:["Android","Retrofit","Networking"], companyPattern:"all" },
    { id:"android-08", category:"Android", difficulty:3, type:"scenario",
      text:"How would you architect an Android app to handle background work reliably across OS versions?",
      expectedConcepts:["WorkManager","Service","JobScheduler","Coroutines","Doze mode","background restrictions"],
      followUpHints:["Why is WorkManager preferred over plain Services for deferrable background tasks?"],
      tags:["Android","Background Processing","Architecture"], companyPattern:"microsoft" },
    { id:"android-09", category:"Android", difficulty:2, type:"conceptual",
      text:"Explain the MVVM architecture pattern in Android. What are its benefits?",
      expectedConcepts:["Model","View","ViewModel","LiveData","separation of concerns","testability"],
      followUpHints:["How does ViewModel survive configuration changes?"],
      tags:["Android","Architecture","MVVM"], companyPattern:"microsoft" },
    { id:"android-10", category:"Android", difficulty:1, type:"conceptual",
      text:"What is Firebase Authentication and how would you implement email/password login?",
      expectedConcepts:["FirebaseAuth","createUserWithEmail","signInWithEmail","AuthStateListener","currentUser"],
      followUpHints:["How would you handle user sessions across app restarts?"],
      tags:["Android","Firebase","Authentication"], companyPattern:"startup" },
  ],

  // ─── SYSTEM DESIGN ────────────────────────────────────────────────
  system_design: [
    { id:"sd-01", category:"System Design", difficulty:2, type:"system_design",
      text:"How would you design a URL shortener like bit.ly? Walk me through your architecture.",
      expectedConcepts:["hashing","base62 encoding","database","cache","load balancer","redirect"],
      followUpHints:["How would you handle 1 billion URLs?","How do you prevent collisions?"],
      tags:["System Design","Scalability"], companyPattern:"google" },
    { id:"sd-02", category:"System Design", difficulty:3, type:"system_design",
      text:"Design a real-time chat application backend. What components would you need?",
      expectedConcepts:["WebSocket","message queue","database","pub/sub","horizontal scaling","presence"],
      followUpHints:["How do you handle message delivery guarantees?"],
      tags:["System Design","Chat","Real-time"], companyPattern:"microsoft" },
    { id:"sd-03", category:"System Design", difficulty:3, type:"system_design",
      text:"How would you design a notification system that delivers push notifications to millions of users?",
      expectedConcepts:["FCM","APNS","message queue","Kafka","fan-out","batch processing","retry"],
      followUpHints:["How do you ensure at-least-once delivery?"],
      tags:["System Design","Notifications"], companyPattern:"amazon" },
    { id:"sd-04", category:"System Design", difficulty:2, type:"system_design",
      text:"Design a caching system for a high-traffic e-commerce product listing page.",
      expectedConcepts:["Redis","cache-aside","TTL","cache invalidation","CDN","consistency"],
      followUpHints:["How do you handle cache stampede?"],
      tags:["System Design","Caching","Performance"], companyPattern:"amazon" },
    { id:"sd-05", category:"System Design", difficulty:3, type:"system_design",
      text:"How would you design a system to handle rate limiting for a public API?",
      expectedConcepts:["token bucket","sliding window","Redis","distributed counter","API gateway"],
      followUpHints:["How do you enforce limits across multiple server instances?"],
      tags:["System Design","API","Rate Limiting"], companyPattern:"google" },
  ],

  // ─── DATABASE DESIGN ──────────────────────────────────────────────
  database: [
    { id:"db-01", category:"Database", difficulty:1, type:"conceptual",
      text:"What is the difference between SQL and NoSQL databases? When would you choose each?",
      expectedConcepts:["relational","schema","ACID","scalability","flexibility","MongoDB","PostgreSQL"],
      followUpHints:["What is eventual consistency?"],
      tags:["Database","SQL","NoSQL"], companyPattern:"all" },
    { id:"db-02", category:"Database", difficulty:2, type:"conceptual",
      text:"Explain database normalization. What are 1NF, 2NF, and 3NF?",
      expectedConcepts:["1NF atomic","2NF partial dependency","3NF transitive dependency","redundancy"],
      followUpHints:["When would you intentionally denormalize a database?"],
      tags:["Database","Normalization"], companyPattern:"microsoft" },
    { id:"db-03", category:"Database", difficulty:2, type:"database",
      text:"Design a database schema for an interview preparation platform with users, sessions, and questions.",
      expectedConcepts:["users table","sessions table","questions table","foreign keys","indexes","relationships"],
      followUpHints:["How would you store per-question scores efficiently?"],
      tags:["Database","Schema Design"], companyPattern:"startup" },
    { id:"db-04", category:"Database", difficulty:2, type:"conceptual",
      text:"What is a database index and how does it improve query performance? What are the trade-offs?",
      expectedConcepts:["B-tree index","read speed","write overhead","covering index","composite index"],
      followUpHints:["When would you NOT want to add an index?"],
      tags:["Database","Indexes","Performance"], companyPattern:"all" },
    { id:"db-05", category:"Database", difficulty:3, type:"scenario",
      text:"A query that used to take 50ms now takes 10 seconds after data grew to 10 million rows. How do you diagnose and fix it?",
      expectedConcepts:["EXPLAIN ANALYZE","missing index","full table scan","query rewrite","pagination"],
      followUpHints:["What is the difference between EXPLAIN and EXPLAIN ANALYZE?"],
      tags:["Database","Performance","Debug"], companyPattern:"amazon" },
  ],

  // ─── HR + BEHAVIORAL ──────────────────────────────────────────────
  behavioral: [
    { id:"hr-01", category:"Behavioral", difficulty:1, type:"behavioral",
      text:"Where do you see yourself in 3-5 years professionally?",
      expectedConcepts:["career goals","growth","role alignment","realistic planning"],
      followUpHints:["What skills will you need to develop to get there?"],
      tags:["HR","Behavioral"], companyPattern:"all" },
    { id:"hr-02", category:"Behavioral", difficulty:2, type:"behavioral",
      text:"Describe a situation where you had to learn a completely new technology under a tight deadline. How did you handle it?",
      expectedConcepts:["adaptability","fast learning","time management","resourcefulness","outcome"],
      followUpHints:["What resources did you use?","Would you do anything differently?"],
      tags:["Behavioral","Adaptability"], companyPattern:"startup" },
    { id:"hr-03", category:"Behavioral", difficulty:2, type:"behavioral",
      text:"Tell me about a time you received critical feedback. How did you respond?",
      expectedConcepts:["growth mindset","feedback reception","action taken","improvement","humility"],
      followUpHints:["What changed as a result of that feedback?"],
      tags:["Behavioral","Growth"], companyPattern:"amazon" },
    { id:"hr-04", category:"Behavioral", difficulty:2, type:"behavioral",
      text:"Describe a project where you went above and beyond what was expected of you.",
      expectedConcepts:["ownership","initiative","impact","problem identification","effort"],
      followUpHints:["What was the impact of your extra effort?"],
      tags:["Behavioral","Ownership"], companyPattern:"amazon" },
  ],

  // ─── FULLSTACK / BACKEND ───────────────────────────────────────────
  fullstack: [
    { id:"fs-01", category:"Backend", difficulty:1, type:"conceptual",
      text:"What is REST and what are the key principles that make an API RESTful?",
      expectedConcepts:["stateless","resources","HTTP methods","uniform interface","representations"],
      followUpHints:["What is the difference between PUT and PATCH?"],
      tags:["Backend","REST","API"], companyPattern:"all" },
    { id:"fs-02", category:"Backend", difficulty:2, type:"conceptual",
      text:"How does JWT-based authentication work? Walk me through the flow from login to accessing a protected resource.",
      expectedConcepts:["JWT","header.payload.signature","Bearer token","expiry","refresh token"],
      followUpHints:["What are the security risks of storing JWT in localStorage?"],
      tags:["Backend","Auth","Security"], companyPattern:"all" },
    { id:"fs-03", category:"Frontend", difficulty:1, type:"conceptual",
      text:"What is the Virtual DOM in React and why does it improve performance?",
      expectedConcepts:["Virtual DOM","reconciliation","diffing","batch updates","real DOM"],
      followUpHints:["What is the key prop and why is it important in lists?"],
      tags:["React","Frontend","Performance"], companyPattern:"all" },
    { id:"fs-04", category:"Frontend", difficulty:2, type:"conceptual",
      text:"What are React hooks? Explain useState and useEffect with practical examples.",
      expectedConcepts:["hooks","useState","useEffect","side effects","cleanup","dependency array"],
      followUpHints:["What happens if the dependency array in useEffect is empty?"],
      tags:["React","Hooks"], companyPattern:"all" },
    { id:"fs-05", category:"Backend", difficulty:3, type:"scenario",
      text:"Your Node.js API starts returning 503 errors under high traffic. What would you investigate and how would you fix it?",
      expectedConcepts:["event loop","blocking code","horizontal scaling","load balancer","async","connection pool"],
      followUpHints:["How would you use clustering in Node.js?"],
      tags:["Backend","Performance","Debugging"], companyPattern:"amazon" },
  ],
};

// ─── FOCUS CATEGORY MAP ────────────────────────────────────────────
const FOCUS_MAP = {
  "android": ["general","android","java","oop","dsa"],
  "dsa": ["general","dsa","oop","java"],
  "system_design": ["general","system_design","database","fullstack"],
  "database": ["general","database","system_design","fullstack"],
  "java": ["general","java","oop","dsa","fullstack"],
  "hr": ["general","behavioral"],
  "mixed": ["general","android","java","oop","dsa","system_design","database","behavioral","fullstack"],
};

function getQuestionsForFocus(focus, difficultyLevel, count = 3, usedIds = []) {
  const focusKey = (focus || "mixed").toLowerCase().replace(/\s+/g,"_").replace("java_core","java").replace("hr_+_behavioral","hr").replace("android_development","android").replace("database_design","database");
  const categories = FOCUS_MAP[focusKey] || FOCUS_MAP["mixed"];

  let allQ = [];
  for (const cat of categories) {
    const catQuestions = QUESTION_BANK[cat] || [];
    for (const q of catQuestions) {
      if (!usedIds.includes(q.id) && Math.abs(q.difficulty - difficultyLevel) <= 0.5) {
        allQ.push(q);
      }
    }
  }

  if (allQ.length < count) {
    for (const cat of categories) {
      for (const q of QUESTION_BANK[cat] || []) {
        if (!usedIds.includes(q.id) && !allQ.find(x => x.id === q.id)) {
          allQ.push(q);
        }
      }
    }
  }

  return allQ.sort(() => Math.random() - 0.5).slice(0, count);
}

// Legacy compatibility
function getQuestionsForRole(role, difficultyLevel, count = 3, usedIds = []) {
  const r = (role || "").toLowerCase();
  let focus = "mixed";
  if (r.includes("android")) focus = "android";
  else if (r.includes("java") || r.includes("backend")) focus = "java";
  else if (r.includes("dsa") || r.includes("algorithm")) focus = "dsa";
  else if (r.includes("system")) focus = "system_design";
  return getQuestionsForFocus(focus, difficultyLevel, count, usedIds);
}

function getWarmupQuestion(role, usedIds = []) {
  const qs = getQuestionsForRole(role, 1, 5, usedIds);
  return qs.find(q => q.category === "General" || q.difficulty === 1) || qs[0];
}

function getFollowUps(questionId) {
  for (const cat of Object.values(QUESTION_BANK)) {
    for (const q of cat) {
      if (q.id === questionId && q.followUpHints?.length) {
        return q.followUpHints;
      }
    }
  }
  return [];
}

module.exports = {
  QUESTION_BANK,
  FOCUS_MAP,
  getQuestionsForRole,
  getQuestionsForFocus,
  getWarmupQuestion,
  getFollowUps,
};
