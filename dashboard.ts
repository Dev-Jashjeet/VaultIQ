import getData from "./geminiApi.js";
import type { calData, income, transaction } from "./modules";
import type user from "./modules";

const logoBox = document.querySelector(".logo-box")! as HTMLDivElement;
const userProfileName = document.querySelectorAll(".userprofile")! ;
const logoutBtn = document.querySelector(".logout-btn")! as HTMLButtonElement;
const BMESCont = document.querySelectorAll(".BMEScont")! ;
const transactionBtn = document.querySelector(".add-TransactionBtn")! as HTMLButtonElement;
const body = document.querySelector("body")! as HTMLBodyElement;
const profilePic = document.querySelectorAll(".profile-photo-cls")!;
const picFile = document.querySelector("#profile-photo")! as HTMLInputElement;
let Person: user; // Main user Object where all calculations take place

// Function that return Login User object
function getUserData(): user {
    const loginUserEmail: string = sessionStorage.getItem("loginemail")!;
    const usersDetails = JSON.parse(localStorage.getItem("usersDetails")!);
    for(const users of usersDetails) {
        if(users.email === loginUserEmail) {
            return users;
        }
    }
    throw new Error("User not found");
}

// Function to change profile photo and set to local storage (Base64 version)
picFile.addEventListener("change", (): void => {
    const file = picFile.files?.[0];
    if (!file) {
        return;
    }
    for (let ele of profilePic) {
            (ele as HTMLImageElement).src = "";
        }
    const reader = new FileReader();
    reader.onload = function (e) {
        const base64String = e.target?.result as string;
        // Set image in UI
        for (let ele of profilePic) {
            (ele as HTMLImageElement).src = base64String;
        }

        // Update Person and localStorage
        const usersDetails: user[] = JSON.parse(localStorage.getItem("usersDetails")!);
        for (const user of usersDetails) {
            if (user.email === Person.email) {
                user.photo = base64String;
                break;
            }
        }
        localStorage.setItem("usersDetails", JSON.stringify(usersDetails));
    };
    reader.readAsDataURL(file); // Convert file to Base64
});

// Function for top BMES Blocks to show balance,amount etc on boxes
function getBMES(Person: user): void {
    if(Person.transactions.length===0) {    // If new user login and he do not added any transactions
        (BMESCont[0]! as HTMLHeadingElement).innerHTML = `₹ ${Person.salary}`;
        (BMESCont[1]! as HTMLHeadingElement).innerHTML = `₹${0}`;
        (BMESCont[2]! as HTMLHeadingElement).innerHTML = "₹0";
        (BMESCont[3]! as HTMLHeadingElement).innerHTML = `₹ ${Person.salary}`;
    }
    else {
        const calcExpense: calData = calcIncomeExpense(Person);
        const response = getAIPrompt(calcExpense,Person);
        updateBMES(calcExpense);
    }
    return; 
}

// Function when page reloads
(function reload(): void {
    Person = getUserData();
    getBMES(Person); // Calling getBMES
    transactionList(Person); //Calling to add transaction list
    (userProfileName[0] as HTMLHeadingElement).innerHTML = Person.name;
    (userProfileName[1] as HTMLParagraphElement).innerHTML = Person.email;
    (userProfileName[2] as HTMLHeadingElement).innerHTML = `Welcome, ${(Person.name).split(" ")[0]}!`;
    if(Person.photo) {
            const photoURL = Person.photo;
            for(let ele of profilePic) {
            (ele as HTMLImageElement).src = Person.photo;
        }
    }
    if(Person.gemini_suggestions) {
        for(let data of Person.gemini_suggestions) {
            const aiListLabel = document.querySelector(".list-cont")! as HTMLUListElement;
             const list = document.createElement("li");
            list.innerHTML = `${data}`;
            aiListLabel.appendChild(list);
        }
    }
    return;
}) ();

// Function when user clicks web icon so the page reloads
logoBox.addEventListener("click", (): void => {
    window.location.assign("dashboard.html");
});

//Function when user click logout
logoutBtn.addEventListener('click', (): void => {
    sessionStorage.clear();
    window.location.replace("index.html");
    return;
});

//Function when user wants to add transaction by clicking transaction button
transactionBtn.addEventListener("click", (): void => {
    const AITD = document.querySelectorAll(".add-Transaction")!;
    const tBody = document.querySelector("#table-body")! as HTMLTableElement;
    let amount: number;
    if(Number((AITD[0]! as HTMLInputElement).value) > 0  && (AITD[1]! as HTMLSelectElement).value !=="Income / Expense" && (AITD[2]! as HTMLInputElement).value !== "Select Type" && (AITD[3]! as HTMLInputElement).value !== "") {

        amount = Number((AITD[0]! as HTMLInputElement).value);
        // This is the area that adds the desired transaction added in list -->
        const transType = (AITD[1]! as HTMLSelectElement).value as income;

        let trow = document.createElement("tr");
        let tdes0 = document.createElement("td");
        let tdes1 = document.createElement("td");
        let tdes2 = document.createElement("td");
        let tdes3 = document.createElement("td");
        let tdes4 = document.createElement("td");
        let delbtn = document.createElement("button");

        tdes0.innerHTML = `${(AITD[3]! as HTMLInputElement).value}`;
        tdes1.innerHTML = `₹ ${(AITD[0]! as HTMLInputElement).value}`;
        tdes2.innerHTML = `${(AITD[2]! as HTMLInputElement).value}`;
        tdes3.innerHTML = `${transType}`
        delbtn.innerHTML = "Delete";
        delbtn.classList.add("delete-btn");

        tdes4.appendChild(delbtn);
        trow.appendChild(tdes0);
        trow.appendChild(tdes1);
        trow.appendChild(tdes2);
        trow.appendChild(tdes3);
        trow.appendChild(tdes4);
        tBody.prepend(trow);

        //Addition of the Entered transaction to the Person Object ---->
        const newTransaction: transaction = {
            date: tdes0.innerHTML,
            amount: Number((AITD[0]! as HTMLInputElement).value),
            category: tdes2.innerHTML,
            type: tdes3.innerHTML as "Income"|"Expense",
        }
        Person.transactions.push(newTransaction);
        // ---------< Area Completed

        getBMES(Person);
        
        // Local updation to Local Storage --->
        const usersDetails: user[] = JSON.parse(localStorage.getItem("usersDetails")!);
        for(const user of usersDetails) {
            if(user.email === Person.email) {
                user.transactions = Person.transactions;
                break;
            }
        }
        localStorage.setItem("usersDetails", JSON.stringify(usersDetails));
        // ---------< Area completed

        // AI SUGGESTION
        
        updateAIRecommendation(Person);

        (AITD[0]! as HTMLInputElement).value = "";
        (AITD[1]! as HTMLInputElement).value = "Income / Expense";
        (AITD[2]! as HTMLInputElement).value = "Select Type";
        (AITD[3]! as HTMLInputElement).value = "";
        // ------< Area completed
        
    }
    return;
});

function calcIncomeExpense(Person: user): calData {
    let totalIncome: number = 0;
    let totalExpense: number = 0;
    for(let tns of Person.transactions as transaction[]) {
        if(tns.type === "Expense") {
            totalExpense += tns.amount;
            continue;
        }
        totalIncome += tns.amount;
    }
    const totalBalance: number = totalIncome-totalExpense;
    return {totalBalance,totalIncome, totalExpense};
}

function updateBMES(data: calData): void {
    const totalBalance = data.totalBalance;
    const totalIncome = data.totalIncome;
    const totalExpense = data.totalExpense;
    (BMESCont[0]! as HTMLHeadElement).innerHTML = `₹ ${(Person.salary+totalBalance<0)? 0:Person.salary+totalBalance}`;
    (BMESCont[1]! as HTMLHeadElement).innerHTML = `₹ ${data.totalIncome}`;
    (BMESCont[2]! as HTMLHeadElement).innerHTML = `₹ ${totalExpense}`;
    (BMESCont[3]! as HTMLHeadElement).innerHTML = `₹ ${Person.salary}`;
    return;
}

function transactionList(Person: user): void {
    const tBody = document.querySelector("#table-body")! as HTMLTableElement;
    for(let data of Person.transactions as transaction[]) {
        let trow = document.createElement("tr");
        let tdes0 = document.createElement("td");
        let tdes1 = document.createElement("td");
        let tdes2 = document.createElement("td");
        let tdes3 = document.createElement("td");
        let tdes4 = document.createElement("td");
        let delbtn = document.createElement("button");

        tdes0.innerHTML = `${data.date}`;
        tdes1.innerHTML = `₹ ${data.amount}`;
        tdes2.innerHTML = `${data.category}`;
        tdes3.innerHTML = `${data.type}`;
        delbtn.innerHTML = `Delete`;

        delbtn.classList.add("delete-btn");

        tdes4.appendChild(delbtn);
        trow.appendChild(tdes0);
        trow.appendChild(tdes1);
        trow.appendChild(tdes2);
        trow.appendChild(tdes3);
        trow.appendChild(tdes4);
        tBody.prepend(trow);
    }
    return;
};

// When User clicks delete button the DOM list deleted
body.addEventListener('click', (e): void => {
    const target = e.target as HTMLElement;
    if(target.classList.contains("delete-btn")) {
        const row = target.closest("tr")!;
        
        const date = row.children[0]!.textContent!;
        const amount = row.children[1]!.textContent!;
        const category = row.children[2]!.textContent!;
        const type = row.children[3]!.textContent! as "Income"|"Expense";
        
        const tempTransaction: transaction = {   // Object of user data
            date: date,
            amount: Number(amount.replace("₹","")),
            category: category!,
            type: type,
        }
        // re-evaluate the amount, savings etc
        reEvaluate(Person,tempTransaction);
        row.remove();
        return;
    }
    return;
});

// Deletion of transaction list when user clicks DELETE button and updation to local storage
function reEvaluate(Person: user,tempTransaction: transaction): void {
    const arr = Person.transactions;
    for(let i=0; i<arr.length; i++) {
        if(arr[i]!.amount === tempTransaction.amount && arr[i]!.date === tempTransaction.date && arr[i]!.category === tempTransaction.category && arr[i]!.type === tempTransaction.type) {
            arr.splice(i,1);
        }
    }
    Person.transactions = arr;
    getBMES(Person);

    // ReUpdate gemini AI Suggestion
    updateAIRecommendation(Person);

    // Local updation to Local Storage --->
    const usersDetails: user[] = JSON.parse(localStorage.getItem("usersDetails")!);
    for(const user of usersDetails) {
        if(user.email === Person.email) {
            user.transactions = Person.transactions;
            break;
        }
    }
    localStorage.setItem("usersDetails", JSON.stringify(usersDetails));
    // ---------< Area completed

    return;
}

// Function to make prompt for gemini
function getAIPrompt(data: calData, Person: user): string {
    const prompt = `
    Monthly Salary: ${Person.salary}
    Total Income: ${data.totalIncome}
    Total Expenditure: ${data.totalExpense}
    Total Balance Remaining: ${Math.abs(data.totalBalance)}

    Give exactly one financial recommendation that is something based on target like you have
    you have to do this in a particular day and in upcomming week, also you can consider to 
    give advice to save how much persentage to go to that target in 5-7 words with words based on salary,
    income, expenditure, balance remaining only. Also add some attractive emojis in between the text that looks attractive`;
    return prompt;
}

// Function to call Gemini API
async function updateAIRecommendation(Person: user): Promise<void> {
    const moneyData = calcIncomeExpense(Person);
    const prompt = getAIPrompt(moneyData,Person);
    const response = await getData(prompt);
    if(response !== null) {
        aiSuggestionList(response);
    }
    return;
}

// Function to add List on gemini AI (Beta) container
function aiSuggestionList(response: string): void {
    const aiListLabel = document.querySelector(".list-cont")! as HTMLUListElement;
    const list = document.createElement("li");
    list.innerHTML = `${response}`;
    aiListLabel.prepend(list);

    // Adding text into array
    if(!Person.gemini_suggestions) {
        const arr: string[] = [];
        arr.unshift(response);
        Person.gemini_suggestions = arr;
    } else {
        const arr: string[] = Person.gemini_suggestions;
        if(arr.length >= 4) {
            arr.pop();
        }
        arr.unshift(response);
    }

    //Adding Local Storage
    let usersDetails: user[] = JSON.parse(localStorage.getItem("usersDetails")!);
    for(let user of usersDetails) {
        if(user.email === Person.email) {
            user.gemini_suggestions = Person.gemini_suggestions;
            break;
        }
    }
    localStorage.setItem("usersDetails", JSON.stringify(usersDetails));
    return;
}
