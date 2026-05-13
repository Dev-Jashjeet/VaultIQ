interface transaction {
    readonly date: string,
    readonly amount: number,
    readonly type: "Income"|"Expense",
}

interface user {
    readonly name: string,
    readonly email: string,
    readonly password: string,
    readonly salary: number,
    transactions: transaction[],
}

const strPerson: string = localStorage.getItem("usersDetails")!;
const Persons = JSON.parse(strPerson);
const sPersonEmail = sessionStorage.getItem("loginemail");
let Person!: user;
let Expenses: Array<number> = [0,0,0,0,0,0,0,0,0,0,0,0];

for(let user of Persons) {
    if(user.email === sPersonEmail) {
        Person = user;
    }
}

if(Person) {
    for(let exp of Person.transactions) {
        if(exp.type === "Expense") {
            const D = new Date(exp.date);
            const date: number = Number(D.getMonth());
            Expenses[date] = (Expenses[date] || 0) +  exp.amount;
        }
    }
}

declare var Chart: any;

const lineCanvas = document.querySelector("#lineChart") as HTMLCanvasElement;

const chart = new Chart(lineCanvas, {
    type: "line",

    data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],

        datasets: [
            {
                label: "Monthly Expenses",

                data: Expenses,

                borderColor: "#3b82f6",

                backgroundColor: "rgba(59, 130, 246, 0.2)",

                fill: true,

                tension: 0,

                borderWidth: 3,

                pointBackgroundColor: "#3b82f6",

                pointRadius: 0,
            }
        ]
    },

    options: {
        responsive: true,

        maintainAspectRatio: false,

        plugins: {
            legend: {
                position: "bottom"
            }
        },

        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
