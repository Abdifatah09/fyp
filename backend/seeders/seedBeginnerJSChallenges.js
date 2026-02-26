// require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

require("dotenv").config(); // uses process.env (Railway vars)

const { sequelize, Challenge } = require("../models");

const SECTION_ID = "945f684e-f2a9-4f55-88c6-b34e35e0a138";
const LANGUAGE_ID = 102; // JS languageId

const challenges = [
  {
    title: "Add Two Numbers",
    description: "Add numbers and log the result.",
    instructions: "Create variables a=10 and b=5. Log the sum.",
    starterCode: "// Your code here\n",
    solution: "let a = 10;\nlet b = 5;\nconsole.log(a + b);\n",
    order: 2,
  },
  {
    title: "Subtract Two Numbers",
    description: "Subtract numbers and log the result.",
    instructions: "Create variables a=20 and b=7. Log a - b.",
    starterCode: "// Your code here\n",
    solution: "let a = 20;\nlet b = 7;\nconsole.log(a - b);\n",
    order: 3,
  },
  {
    title: "Multiply Two Numbers",
    description: "Multiply numbers and log the result.",
    instructions: "Create variables a=6 and b=4. Log a * b.",
    starterCode: "// Your code here\n",
    solution: "let a = 6;\nlet b = 4;\nconsole.log(a * b);\n",
    order: 4,
  },
  {
    title: "Divide Two Numbers",
    description: "Divide numbers and log the result.",
    instructions: "Create variables a=20 and b=4. Log a / b.",
    starterCode: "// Your code here\n",
    solution: "let a = 20;\nlet b = 4;\nconsole.log(a / b);\n",
    order: 5,
  },
  {
    title: "String Concatenation",
    description: "Combine two strings.",
    instructions: "Create firstName='John' and lastName='Doe'. Log the full name with a space.",
    starterCode: "// Your code here\n",
    solution: "let firstName = \"John\";\nlet lastName = \"Doe\";\nconsole.log(firstName + \" \" + lastName);\n",
    order: 6,
  },
  {
    title: "Template Literals",
    description: "Use backticks to build strings.",
    instructions: "Create name='Aftooje'. Log: Hello, Aftooje!",
    starterCode: "// Your code here\n",
    solution: "let name = \"Aftooje\";\nconsole.log(`Hello, ${name}!`);\n",
    order: 7,
  },
  {
    title: "String Length",
    description: "Get the length of a string.",
    instructions: "Create word='JavaScript'. Log the length of word.",
    starterCode: "// Your code here\n",
    solution: "let word = \"JavaScript\";\nconsole.log(word.length);\n",
    order: 8,
  },
  {
    title: "Uppercase String",
    description: "Convert a string to uppercase.",
    instructions: "Create word='hello'. Log the uppercase version.",
    starterCode: "// Your code here\n",
    solution: "let word = \"hello\";\nconsole.log(word.toUpperCase());\n",
    order: 9,
  },
  {
    title: "Lowercase String",
    description: "Convert a string to lowercase.",
    instructions: "Create word='HeLLo'. Log the lowercase version.",
    starterCode: "// Your code here\n",
    solution: "let word = \"HeLLo\";\nconsole.log(word.toLowerCase());\n",
    order: 10,
  },
  {
    title: "Round a Number",
    description: "Round to the nearest integer.",
    instructions: "Create num=4.6. Log the rounded value.",
    starterCode: "// Your code here\n",
    solution: "let num = 4.6;\nconsole.log(Math.round(num));\n",
    order: 11,
  },
  {
    title: "Floor a Number",
    description: "Round down to the nearest integer.",
    instructions: "Create num=9.9. Log Math.floor(num).",
    starterCode: "// Your code here\n",
    solution: "let num = 9.9;\nconsole.log(Math.floor(num));\n",
    order: 12,
  },
  {
    title: "Ceil a Number",
    description: "Round up to the nearest integer.",
    instructions: "Create num=2.1. Log Math.ceil(num).",
    starterCode: "// Your code here\n",
    solution: "let num = 2.1;\nconsole.log(Math.ceil(num));\n",
    order: 13,
  },
  {
    title: "Check Age",
    description: "Use an if statement to compare a number.",
    instructions: "Create age=18. If age is 18 or more log 'Adult' otherwise log 'Minor'.",
    starterCode: "// Your code here\n",
    solution: "let age = 18;\nif (age >= 18) {\n  console.log(\"Adult\");\n} else {\n  console.log(\"Minor\");\n}\n",
    order: 14,
  },
  {
    title: "Even or Odd",
    description: "Use modulo to check parity.",
    instructions: "Create n=7. If n is even log 'Even' else log 'Odd'.",
    starterCode: "// Your code here\n",
    solution: "let n = 7;\nif (n % 2 === 0) {\n  console.log(\"Even\");\n} else {\n  console.log(\"Odd\");\n}\n",
    order: 15,
  },
  {
    title: "Compare Two Numbers",
    description: "Compare values using if/else.",
    instructions: "Create a=5 and b=10. Log 'a>b' if a>b else log 'a<=b'.",
    starterCode: "// Your code here\n",
    solution: "let a = 5;\nlet b = 10;\nif (a > b) console.log(\"a>b\");\nelse console.log(\"a<=b\");\n",
    order: 16,
  },
  {
    title: "Boolean AND",
    description: "Use && with booleans.",
    instructions: "Create isLoggedIn=true and isAdmin=false. If both true log 'Access granted' else 'Access denied'.",
    starterCode: "// Your code here\n",
    solution:
      "let isLoggedIn = true;\nlet isAdmin = false;\nif (isLoggedIn && isAdmin) {\n  console.log(\"Access granted\");\n} else {\n  console.log(\"Access denied\");\n}\n",
    order: 17,
  },
  {
    title: "Boolean OR",
    description: "Use || with booleans.",
    instructions: "Create hasTicket=false and isVIP=true. If either true log 'Enter' else 'No entry'.",
    starterCode: "// Your code here\n",
    solution:
      "let hasTicket = false;\nlet isVIP = true;\nif (hasTicket || isVIP) {\n  console.log(\"Enter\");\n} else {\n  console.log(\"No entry\");\n}\n",
    order: 18,
  },
  {
    title: "NOT Operator",
    description: "Use ! to invert booleans.",
    instructions: "Create isBanned=false. If NOT banned log 'Welcome' else log 'Blocked'.",
    starterCode: "// Your code here\n",
    solution:
      "let isBanned = false;\nif (!isBanned) {\n  console.log(\"Welcome\");\n} else {\n  console.log(\"Blocked\");\n}\n",
    order: 19,
  },
  {
    title: "Array Basics",
    description: "Create an array and access an element.",
    instructions: "Create arr=[10,20,30]. Log the first element.",
    starterCode: "// Your code here\n",
    solution: "let arr = [10, 20, 30];\nconsole.log(arr[0]);\n",
    order: 20,
  },
  {
    title: "Array Length",
    description: "Find the length of an array.",
    instructions: "Create arr=[1,2,3,4]. Log arr.length.",
    starterCode: "// Your code here\n",
    solution: "let arr = [1, 2, 3, 4];\nconsole.log(arr.length);\n",
    order: 21,
  },
  {
    title: "Push to Array",
    description: "Add an element to the end of an array.",
    instructions: "Create arr=[1,2]. Push 3. Log the array as a string joined by commas.",
    starterCode: "// Your code here\n",
    solution: "let arr = [1, 2];\narr.push(3);\nconsole.log(arr.join(\",\"));\n",
    order: 22,
  },
  {
    title: "Simple for Loop",
    description: "Loop from 1 to 3 and print each number.",
    instructions: "Use a for loop to log 1, then 2, then 3 (each on a new line).",
    starterCode: "// Your code here\n",
    solution: "for (let i = 1; i <= 3; i++) {\n  console.log(i);\n}\n",
    order: 23,
  },
  {
    title: "Sum with Loop",
    description: "Sum values in an array.",
    instructions: "Create nums=[1,2,3,4]. Compute sum using a loop and log it.",
    starterCode: "// Your code here\n",
    solution: "let nums = [1,2,3,4];\nlet sum = 0;\nfor (let i = 0; i < nums.length; i++) sum += nums[i];\nconsole.log(sum);\n",
    order: 24,
  },
  {
    title: "Create a Function",
    description: "Write and call a simple function.",
    instructions: "Write a function greet() that logs 'Hello'. Call it.",
    starterCode: "// Your code here\n",
    solution: "function greet(){\n  console.log(\"Hello\");\n}\ngreet();\n",
    order: 25,
  },
  {
    title: "Function with Parameters",
    description: "Pass arguments to a function.",
    instructions: "Write a function add(a,b) that logs a+b. Call add(3,4).",
    starterCode: "// Your code here\n",
    solution: "function add(a,b){\n  console.log(a + b);\n}\nadd(3,4);\n",
    order: 26,
  },
  {
    title: "Return a Value",
    description: "Return from a function and log the result.",
    instructions: "Write function square(n) that returns n*n. Log square(5).",
    starterCode: "// Your code here\n",
    solution: "function square(n){\n  return n * n;\n}\nconsole.log(square(5));\n",
    order: 27,
  },
  {
    title: "Object Basics",
    description: "Create an object and access a property.",
    instructions: "Create person={name:'Sam', age:20}. Log person.name.",
    starterCode: "// Your code here\n",
    solution: "let person = { name: \"Sam\", age: 20 };\nconsole.log(person.name);\n",
    order: 28,
  },
  {
    title: "Update Object Property",
    description: "Modify an object property.",
    instructions: "Create person={name:'Sam', age:20}. Set age to 21. Log person.age.",
    starterCode: "// Your code here\n",
    solution: "let person = { name: \"Sam\", age: 20 };\nperson.age = 21;\nconsole.log(person.age);\n",
    order: 29,
  },
  {
    title: "Ternary Operator",
    description: "Use condition ? a : b.",
    instructions: "Create score=55. Log 'Pass' if score>=50 else 'Fail'.",
    starterCode: "// Your code here\n",
    solution: "let score = 55;\nconsole.log(score >= 50 ? \"Pass\" : \"Fail\");\n",
    order: 30,
  },
];

async function upsertByTitle(sectionId, row) {
  const existing = await Challenge.findOne({
    where: { sectionId, title: row.title },
  });

  const payload = {
    title: row.title,
    description: row.description,
    instructions: row.instructions,
    starterCode: row.starterCode,
    solution: row.solution,
    order: row.order,
    languageId: LANGUAGE_ID,
    sectionId,
  };

  if (existing) {
    await existing.update(payload);
    return { action: "updated", id: existing.id, title: existing.title };
  }

  const created = await Challenge.create(payload);
  return { action: "created", id: created.id, title: created.title };
}

async function run() {
  await sequelize.authenticate();

  const results = [];
  for (const row of challenges) {
    const r = await upsertByTitle(SECTION_ID, row);
    results.push(r);
  }

  console.log(`Seeded Beginner JS Challenges into section ${SECTION_ID}`);
  console.table(results.map(({ action, title }) => ({ action, title })));

  await sequelize.close();
  process.exit(0);
}

run().catch((e) => {
  console.error("Seeder failed:", e);
  process.exit(1);
});
