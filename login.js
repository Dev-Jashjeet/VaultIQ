const email = document.querySelector("#email");
const password = document.querySelector("#password");
const button = document.querySelector(".login-btn");
const emailPassError = document.querySelectorAll(".error-message");
const loader = document.querySelector(".loader-cont");
const hideShow = document.querySelector(".toggle-icon");
;
button.addEventListener('click', (e) => {
    e.preventDefault();
    let count = 0;
    if (email.value !== "" && password.value !== "") {
        loader.style.display = "flex";
        setTimeout(() => {
            if (localStorage.getItem("usersDetails") !== null) {
                const userDetailsStr = localStorage.getItem("usersDetails");
                const userDetailsObj = JSON.parse(userDetailsStr);
                for (let userDetail of userDetailsObj) {
                    if (userDetail.email === email.value && userDetail.password === password.value) {
                        sessionStorage.setItem("loginemail", userDetail.email);
                        loader.style.display = "none";
                        window.location.replace("dashboard.html");
                        count++;
                        return;
                    }
                    if (userDetail.email === email.value && userDetail.password !== password.value) {
                        loader.style.display = "none";
                        emailPassError[1].style.opacity = "1";
                        emailPassError[1].innerHTML = `Incorrect Password`;
                        count++;
                        return;
                    }
                }
                if (count === 0) {
                    loader.style.display = "none";
                    email.value = "";
                    password.value = "";
                    alert("User not found, please sign up");
                    return;
                }
            }
            else {
                loader.style.display = "none";
                email.value = "";
                password.value = "";
                alert("USER NOT FOUND PLEASE SIGN UP");
                return;
            }
        }, 2000);
    }
    else {
        emailPassError[0].style.opacity = "1";
        emailPassError[1].innerHTML = `Enter valid password`;
        emailPassError[1].style.opacity = "1";
    }
    return;
});
//Function for hide/show
hideShow.addEventListener('click', () => {
    if (password.type === "password") {
        password.type = "text";
    }
    else {
        password.type = "password";
    }
    return;
});
export {};
// Completed
