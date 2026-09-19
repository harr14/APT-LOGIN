/* =========================================================
   DWELLSYNC - SMART APARTMENT COMMUNITY MANAGEMENT SYSTEM
   Member 1 - User Management
   JavaScript ES6
   ========================================================= */


/* =========================================================
   STORAGE KEYS
   ========================================================= */

const USERS_KEY = "dwellsync_users";
const SESSION_KEY = "dwellsync_session";
const COMPLAINTS_KEY = "dwellsync_complaints";
const ANNOUNCEMENTS_KEY = "dwellsync_announcements";


/* =========================================================
   ADMIN ACCOUNT
   ========================================================= */

const ADMIN_ACCOUNT = {
    id: "admin-001",
    name: "DwellSync Administrator",
    email: "admin@dwellsync.local",
    password: "admin123",
    role: "admin",
    status: "Active"
};


/* =========================================================
   BASIC STORAGE FUNCTIONS
   ========================================================= */

function getUsers() {

    const data = localStorage.getItem(USERS_KEY);

    if (!data) {
        return [];
    }

    try {
        return JSON.parse(data);
    } catch (error) {
        console.error("Unable to read users:", error);
        return [];
    }
}


function saveUsers(users) {

    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(users)
    );
}


function getComplaints() {

    const data = localStorage.getItem(COMPLAINTS_KEY);

    if (!data) {
        return [];
    }

    try {
        return JSON.parse(data);
    } catch (error) {
        console.error("Unable to read complaints:", error);
        return [];
    }
}


function saveComplaints(complaints) {

    localStorage.setItem(
        COMPLAINTS_KEY,
        JSON.stringify(complaints)
    );
}


function getAnnouncements() {

    const data = localStorage.getItem(ANNOUNCEMENTS_KEY);

    if (!data) {
        return [];
    }

    try {
        return JSON.parse(data);
    } catch (error) {
        console.error("Unable to read announcements:", error);
        return [];
    }
}


function saveAnnouncements(announcements) {

    localStorage.setItem(
        ANNOUNCEMENTS_KEY,
        JSON.stringify(announcements)
    );
}


/* =========================================================
   SESSION FUNCTIONS
   ========================================================= */

function getSession() {

    const data = sessionStorage.getItem(SESSION_KEY);

    if (!data) {
        return null;
    }

    try {
        return JSON.parse(data);
    } catch (error) {
        console.error("Unable to read session:", error);
        return null;
    }
}


function saveSession(session) {

    sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify(session)
    );
}


function clearSession() {

    sessionStorage.removeItem(SESSION_KEY);
}


/* =========================================================
   GENERATE UNIQUE ID
   ========================================================= */

function generateId() {

    return (
        "resident-" +
        Date.now() +
        "-" +
        Math.floor(Math.random() * 1000)
    );
}


/* =========================================================
   FIND USER
   ========================================================= */

function findUserById(userId) {

    const users = getUsers();

    return users.find(function (user) {
        return user.id === userId;
    }) || null;
}


/* =========================================================
   GET CURRENT USER
   ========================================================= */

function getCurrentUser() {

    const session = getSession();

    if (!session) {
        return null;
    }


    /* Admin */

    if (session.role === "admin") {
        return ADMIN_ACCOUNT;
    }


    /* Resident */

    if (session.role === "resident") {

        const resident = findUserById(
            session.userId
        );

        return resident;
    }


    return null;
}


/* =========================================================
   EMAIL VALIDATION
   ========================================================= */

function isValidEmail(email) {

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);
}


/* =========================================================
   LOGIN
   ========================================================= */

function loginUser(email, password) {

    email = email.trim().toLowerCase();


    /* -----------------------------------------
       ADMIN LOGIN
       ----------------------------------------- */

    if (
        email === ADMIN_ACCOUNT.email &&
        password === ADMIN_ACCOUNT.password
    ) {

        saveSession({
            userId: ADMIN_ACCOUNT.id,
            role: "admin"
        });

        return {
            success: true,
            role: "admin"
        };
    }


    /* -----------------------------------------
       RESIDENT LOGIN
       ----------------------------------------- */

    const users = getUsers();

    const resident = users.find(function (user) {

        return (
            user.email &&
            user.email.toLowerCase() === email
        );

    });


    /* Resident does not exist */

    if (!resident) {

        return {
            success: false,
            message: "Invalid email or password."
        };
    }


    /* Disabled resident */

    if (
        resident.status &&
        resident.status.toLowerCase() === "disabled"
    ) {

        return {
            success: false,
            message: "Your account has been disabled."
        };
    }


    /* Wrong password */

    if (resident.password !== password) {

        return {
            success: false,
            message: "Invalid email or password."
        };
    }


    /* Successful resident login */

    saveSession({
        userId: resident.id,
        role: "resident"
    });


    return {
        success: true,
        role: "resident"
    };
}


/* =========================================================
   LOGOUT
   ========================================================= */

function logoutUser() {

    clearSession();

    showLogin();

    showToast(
        "You have been logged out successfully."
    );
}


/* =========================================================
   PAGE NAVIGATION
   ========================================================= */

function hideAllPages() {

    const loginPage =
        document.getElementById("loginPage");

    const dashboardPage =
        document.getElementById("dashboardPage");

    const profilePage =
        document.getElementById("profilePage");


    if (loginPage) {
        loginPage.style.display = "none";
    }

    if (dashboardPage) {
        dashboardPage.style.display = "none";
    }

    if (profilePage) {
        profilePage.style.display = "none";
    }
}


/* =========================================================
   SHOW LOGIN
   ========================================================= */

function showLogin() {

    hideAllPages();

    const loginPage =
        document.getElementById("loginPage");

    if (loginPage) {
        loginPage.style.display = "block";
    }
}


/* =========================================================
   SHOW DASHBOARD
   ========================================================= */

function showDashboard() {

    if (!requireResident()) {
        return;
    }

    hideAllPages();

    const dashboardPage =
        document.getElementById("dashboardPage");

    if (dashboardPage) {
        dashboardPage.style.display = "block";
    }

    loadDashboardData();
}


/* =========================================================
   SHOW PROFILE
   ========================================================= */

function showProfile() {

    if (!requireResident()) {
        return;
    }

    hideAllPages();

    const profilePage =
        document.getElementById("profilePage");

    if (profilePage) {
        profilePage.style.display = "block";
    }

    loadProfile();
}


/* =========================================================
   REQUIRE LOGIN
   ========================================================= */

function requireLogin() {

    const session = getSession();

    if (!session) {

        showLogin();

        return false;
    }

    return true;
}


/* =========================================================
   REQUIRE RESIDENT
   ========================================================= */

function requireResident() {

    if (!requireLogin()) {
        return false;
    }

    const session = getSession();

    if (
        !session ||
        session.role !== "resident"
    ) {

        showToast(
            "Resident access required."
        );

        return false;
    }

    return true;
}


/* =========================================================
   REQUIRE ADMIN
   ========================================================= */

function requireAdmin() {

    if (!requireLogin()) {
        return false;
    }

    const session = getSession();

    if (
        !session ||
        session.role !== "admin"
    ) {

        showToast(
            "Admin access required."
        );

        return false;
    }

    return true;
}


/* =========================================================
   DASHBOARD DATA
   ========================================================= */

function loadDashboardData() {

    const user = getCurrentUser();

    if (!user) {
        showLogin();
        return;
    }


    /* -----------------------------------------
       BASIC USER INFORMATION
       ----------------------------------------- */

    setText(
        "welcomeName",
        user.name || "Resident"
    );

    setText(
        "flatNumber",
        user.flat || "-"
    );

    setText(
        "profileName",
        user.name || "-"
    );

    setText(
        "profileEmail",
        user.email || "-"
    );

    setText(
        "infoFlat",
        user.flat || "-"
    );

    setText(
        "infoPhone",
        user.phone || "-"
    );

    setText(
        "infoType",
        user.residentType || "-"
    );

    setText(
        "apartmentFlat",
        user.flat || "-"
    );


    /* -----------------------------------------
       PROFILE AVATAR
       ----------------------------------------- */

    setText(
        "profileAvatar",
        getInitials(user.name)
    );


    /* -----------------------------------------
       COMPLAINTS
       ----------------------------------------- */

    loadDashboardComplaints(user);


    /* -----------------------------------------
       ANNOUNCEMENTS
       ----------------------------------------- */

    loadAnnouncementCount();
}


/* =========================================================
   LOAD DASHBOARD COMPLAINTS
   ========================================================= */

function loadDashboardComplaints(user) {

    const complaints = getComplaints();

    const userComplaints =
        complaints.filter(function (complaint) {

            return (
                complaint.userId === user.id ||
                complaint.residentId === user.id ||
                complaint.email === user.email
            );

        });


    let openCount = 0;
    let pendingCount = 0;
    let completedCount = 0;


    userComplaints.forEach(function (complaint) {

        const status =
            String(
                complaint.status || "Open"
            ).toLowerCase();


        if (
            status === "open" ||
            status === "new"
        ) {

            openCount++;

        } else if (
            status === "pending" ||
            status === "in progress" ||
            status === "in_progress"
        ) {

            pendingCount++;

        } else if (
            status === "completed" ||
            status === "closed" ||
            status === "resolved"
        ) {

            completedCount++;
        }

    });


    setText(
        "openComplaints",
        openCount
    );

    setText(
        "pendingComplaints",
        pendingCount
    );

    setText(
        "completedComplaints",
        completedCount
    );


    renderRecentComplaints(
        userComplaints
    );
}


/* =========================================================
   RENDER RECENT COMPLAINTS
   ========================================================= */

function renderRecentComplaints(complaints) {

    const container =
        document.getElementById(
            "complaintsContainer"
        );


    if (!container) {
        return;
    }


    if (complaints.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">✓</div>
                <h3>No maintenance complaints yet</h3>
                <p>
                    Report a problem when you need assistance.
                </p>
            </div>
        `;

        return;
    }


    /* Latest complaints first */

    const recentComplaints =
        complaints.slice().reverse().slice(0, 5);


    container.innerHTML = "";


    recentComplaints.forEach(function (complaint) {

        const item =
            document.createElement("div");

        item.className = "complaint-item";


        const title =
            complaint.title ||
            complaint.subject ||
            complaint.category ||
            "Maintenance Request";


        const status =
            complaint.status ||
            "Open";


        item.innerHTML = `
            <div class="complaint-info">
                <h4>${escapeHTML(title)}</h4>
                <p>
                    ${escapeHTML(
                        complaint.description ||
                        "No description provided."
                    )}
                </p>
            </div>

            <span class="status ${getStatusClass(status)}">
                ${escapeHTML(status)}
            </span>
        `;


        container.appendChild(item);
    });
}


/* =========================================================
   ANNOUNCEMENT COUNT
   ========================================================= */

function loadAnnouncementCount() {

    const announcements =
        getAnnouncements();

    setText(
        "announcementCount",
        announcements.length
    );
}


/* =========================================================
   PROFILE
   ========================================================= */

function loadProfile() {

    const user = getCurrentUser();

    if (!user) {
        showLogin();
        return;
    }


    /* -----------------------------------------
       PROFILE CARD
       ----------------------------------------- */

    setText(
        "largeAvatar",
        getInitials(user.name)
    );

    setText(
        "profileCardName",
        user.name || "-"
    );

    setText(
        "profileCardEmail",
        user.email || "-"
    );

    setText(
        "profileCardFlat",
        user.flat || "-"
    );


    /* -----------------------------------------
       PROFILE FORM
       ----------------------------------------- */

    const nameInput =
        document.getElementById(
            "profileNameInput"
        );

    const phoneInput =
        document.getElementById(
            "profilePhoneInput"
        );

    const emailInput =
        document.getElementById(
            "profileEmailInput"
        );

    const flatInput =
        document.getElementById(
            "profileFlatInput"
        );

    const typeInput =
        document.getElementById(
            "profileTypeInput"
        );

    const statusInput =
        document.getElementById(
            "profileStatusInput"
        );


    if (nameInput) {
        nameInput.value = user.name || "";
        nameInput.disabled = true;
    }

    if (phoneInput) {
        phoneInput.value = user.phone || "";
        phoneInput.disabled = true;
    }

    if (emailInput) {
        emailInput.value = user.email || "";
        emailInput.disabled = true;
    }

    if (flatInput) {
        flatInput.value = user.flat || "";
        flatInput.disabled = true;
    }

    if (typeInput) {
        typeInput.value =
            user.residentType || "";
        typeInput.disabled = true;
    }

    if (statusInput) {
        statusInput.value =
            user.status || "Active";
        statusInput.disabled = true;
    }


    setText(
        "apartmentInfoFlat",
        user.flat || "-"
    );


    /* -----------------------------------------
       RESET FORM BUTTONS
       ----------------------------------------- */

    const editButton =
        document.getElementById(
            "editButton"
        );

    const formActions =
        document.getElementById(
            "formActions"
        );


    if (editButton) {
        editButton.style.display = "inline-flex";
    }

    if (formActions) {
        formActions.style.display = "none";
    }
}


/* =========================================================
   ENABLE PROFILE EDIT
   ========================================================= */

function enableProfileEdit() {

    const nameInput =
        document.getElementById(
            "profileNameInput"
        );

    const phoneInput =
        document.getElementById(
            "profilePhoneInput"
        );

    const editButton =
        document.getElementById(
            "editButton"
        );

    const formActions =
        document.getElementById(
            "formActions"
        );


    if (nameInput) {
        nameInput.disabled = false;
        nameInput.focus();
    }

    if (phoneInput) {
        phoneInput.disabled = false;
    }

    if (editButton) {
        editButton.style.display = "none";
    }

    if (formActions) {
        formActions.style.display = "flex";
    }
}


/* =========================================================
   CANCEL PROFILE EDIT
   ========================================================= */

function cancelProfileEdit() {

    loadProfile();
}


/* =========================================================
   UPDATE PROFILE
   ========================================================= */

function updateProfile() {

    const user = getCurrentUser();

    if (!user) {
        showLogin();
        return;
    }


    const nameInput =
        document.getElementById(
            "profileNameInput"
        );

    const phoneInput =
        document.getElementById(
            "profilePhoneInput"
        );


    const name =
        nameInput ?
        nameInput.value.trim() :
        "";

    const phone =
        phoneInput ?
        phoneInput.value.trim() :
        "";


    /* -----------------------------------------
       VALIDATION
       ----------------------------------------- */

    if (!name) {

        showFieldError(
            "nameError",
            "Name is required."
        );

        return;
    }


    if (!phone) {

        showFieldError(
            "phoneError",
            "Phone number is required."
        );

        return;
    }


    clearFieldError("nameError");
    clearFieldError("phoneError");


    /* -----------------------------------------
       UPDATE USER
       ----------------------------------------- */

    const users = getUsers();

    const userIndex =
        users.findIndex(function (item) {

            return item.id === user.id;

        });


    if (userIndex === -1) {

        showToast(
            "Unable to update profile."
        );

        return;
    }


    users[userIndex].name = name;
    users[userIndex].phone = phone;


    saveUsers(users);


    /* -----------------------------------------
       RELOAD PROFILE
       ----------------------------------------- */

    loadProfile();

    showToast(
        "Profile updated successfully."
    );
}


/* =========================================================
   ADMIN - REGISTER RESIDENT
   ========================================================= */

function registerResident(
    name,
    email,
    phone,
    flat,
    residentType,
    password
) {

    const users = getUsers();


    name = String(name || "").trim();

    email =
        String(email || "")
            .trim()
            .toLowerCase();

    phone =
        String(phone || "").trim();

    flat =
        String(flat || "")
            .trim()
            .toUpperCase();

    residentType =
        String(residentType || "").trim();

    password =
        String(password || "");


    /* -----------------------------------------
       REQUIRED FIELDS
       ----------------------------------------- */

    if (
        !name ||
        !email ||
        !phone ||
        !flat ||
        !residentType ||
        !password
    ) {

        return {
            success: false,
            message: "All fields are required."
        };
    }


    /* -----------------------------------------
       EMAIL VALIDATION
       ----------------------------------------- */

    if (!isValidEmail(email)) {

        return {
            success: false,
            message: "Please enter a valid email address."
        };
    }


    /* -----------------------------------------
       PASSWORD VALIDATION
       ----------------------------------------- */

    if (password.length < 6) {

        return {
            success: false,
            message: "Password must contain at least 6 characters."
        };
    }


    /* -----------------------------------------
       DUPLICATE EMAIL
       ----------------------------------------- */

    const emailExists =
        users.some(function (user) {

            return (
                user.email &&
                user.email.toLowerCase() === email
            );

        });


    if (emailExists) {

        return {
            success: false,
            message: "This email is already registered."
        };
    }


    /* -----------------------------------------
       DUPLICATE FLAT
       ----------------------------------------- */

    const flatExists =
        users.some(function (user) {

            return (
                user.flat &&
                user.flat.toUpperCase() === flat
            );

        });


    if (flatExists) {

        return {
            success: false,
            message: "This flat is already registered."
        };
    }


    /* -----------------------------------------
       CREATE RESIDENT
       ----------------------------------------- */

    const resident = {

        id: generateId(),

        name: name,

        email: email,

        phone: phone,

        flat: flat,

        residentType: residentType,

        password: password,

        role: "resident",

        status: "Active",

        createdAt:
            new Date().toISOString()
    };


    users.push(resident);

    saveUsers(users);


    return {
        success: true,
        message: "Resident added successfully.",
        user: resident
    };
}


/* =========================================================
   GET RESIDENT BY ID
   ========================================================= */

function getResidentById(userId) {

    const users = getUsers();

    return users.find(function (user) {

        return (
            user.id === userId &&
            user.role === "resident"
        );

    }) || null;
}


/* =========================================================
   UPDATE RESIDENT BY ID
   ========================================================= */

function updateResidentById(
    userId,
    updatedData
) {

    const users = getUsers();

    const index =
        users.findIndex(function (user) {

            return user.id === userId;

        });


    if (index === -1) {

        return {
            success: false,
            message: "Resident not found."
        };
    }


    const currentUser =
        users[index];


    /* Name */

    if (
        updatedData.name !== undefined
    ) {

        currentUser.name =
            String(
                updatedData.name
            ).trim();
    }


    /* Email */

    if (
        updatedData.email !== undefined
    ) {

        const email =
            String(
                updatedData.email
            )
            .trim()
            .toLowerCase();


        if (!isValidEmail(email)) {

            return {
                success: false,
                message: "Invalid email address."
            };
        }


        const duplicate =
            users.some(function (user) {

                return (
                    user.id !== userId &&
                    user.email &&
                    user.email.toLowerCase() === email
                );

            });


        if (duplicate) {

            return {
                success: false,
                message: "This email is already registered."
            };
        }


        currentUser.email = email;
    }


    /* Phone */

    if (
        updatedData.phone !== undefined
    ) {

        currentUser.phone =
            String(
                updatedData.phone
            ).trim();
    }


    /* Flat */

    if (
        updatedData.flat !== undefined
    ) {

        const flat =
            String(
                updatedData.flat
            )
            .trim()
            .toUpperCase();


        const duplicateFlat =
            users.some(function (user) {

                return (
                    user.id !== userId &&
                    user.flat &&
                    user.flat.toUpperCase() === flat
                );

            });


        if (duplicateFlat) {

            return {
                success: false,
                message: "This flat is already registered."
            };
        }


        currentUser.flat = flat;
    }


    /* Resident type */

    if (
        updatedData.residentType !== undefined
    ) {

        currentUser.residentType =
            String(
                updatedData.residentType
            ).trim();
    }


    saveUsers(users);


    return {
        success: true,
        message: "Resident updated successfully.",
        user: currentUser
    };
}


/* =========================================================
   ENABLE / DISABLE RESIDENT
   ========================================================= */

function setResidentStatus(
    userId,
    status
) {

    const users = getUsers();

    const user =
        users.find(function (item) {

            return item.id === userId;

        });


    if (!user) {

        return {
            success: false,
            message: "Resident not found."
        };
    }


    if (
        status !== "Active" &&
        status !== "Disabled"
    ) {

        return {
            success: false,
            message: "Invalid account status."
        };
    }


    user.status = status;

    saveUsers(users);


    return {
        success: true,
        message:
            status === "Active"
                ? "Resident account enabled."
                : "Resident account disabled."
    };
}


/* =========================================================
   RESET RESIDENT PASSWORD
   ========================================================= */

function resetResidentPassword(
    userId,
    newPassword
) {

    if (!newPassword) {

        return {
            success: false,
            message: "Password is required."
        };
    }


    if (newPassword.length < 6) {

        return {
            success: false,
            message:
                "Password must contain at least 6 characters."
        };
    }


    const users = getUsers();

    const user =
        users.find(function (item) {

            return item.id === userId;

        });


    if (!user) {

        return {
            success: false,
            message: "Resident not found."
        };
    }


    user.password = newPassword;

    saveUsers(users);


    return {
        success: true,
        message:
            "Resident password reset successfully."
    };
}


/* =========================================================
   AVAILABLE FLATS
   ========================================================= */

function getAvailableFlats() {

    const allFlats = [
        "A-101",
        "A-102",
        "A-103",
        "A-104",
        "A-105",
        "A-106",
        "A-107",
        "A-108",
        "A-109",
        "A-110",
        "A-111",
        "A-112",
        "A-113",
        "A-114",
        "A-115"
    ];


    const users = getUsers();


    const occupiedFlats =
        users.map(function (user) {

            return user.flat
                ? user.flat.toUpperCase()
                : "";

        });


    return allFlats.filter(function (flat) {

        return occupiedFlats.indexOf(flat) === -1;

    });
}


/* =========================================================
   TOAST MESSAGE
   ========================================================= */

function showToast(message) {

    const toast =
        document.getElementById("toast");


    if (!toast) {
        return;
    }


    toast.textContent = message;

    toast.classList.add("show");


    setTimeout(function () {

        toast.classList.remove("show");

    }, 3000);
}


/* =========================================================
   SET TEXT SAFELY
   ========================================================= */

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent =
            value !== undefined &&
            value !== null
                ? value
                : "";
    }
}


/* =========================================================
   GET USER INITIALS
   ========================================================= */

function getInitials(name) {

    if (!name) {
        return "DS";
    }


    const words =
        name.trim().split(/\s+/);


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();
    }


    return (
        words[0].charAt(0) +
        words[words.length - 1].charAt(0)
    ).toUpperCase();
}


/* =========================================================
   STATUS CSS CLASS
   ========================================================= */

function getStatusClass(status) {

    const value =
        String(status || "")
            .toLowerCase();


    if (
        value === "completed" ||
        value === "closed" ||
        value === "resolved"
    ) {

        return "completed";
    }


    if (
        value === "pending" ||
        value === "in progress" ||
        value === "in_progress"
    ) {

        return "pending";
    }


    return "open";
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   FIELD ERROR
   ========================================================= */

function showFieldError(
    elementId,
    message
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent = message;
        element.style.display = "block";
    }
}


function clearFieldError(
    elementId
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent = "";
        element.style.display = "none";
    }
}


/* =========================================================
   LOGIN FORM
   ========================================================= */

function initializeLoginForm() {

    const loginForm =
        document.getElementById(
            "loginForm"
        );


    if (!loginForm) {
        return;
    }


    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const emailInput =
                document.getElementById(
                    "loginEmail"
                );


            const passwordInput =
                document.getElementById(
                    "loginPassword"
                );


            const emailError =
                document.getElementById(
                    "emailError"
                );


            const passwordError =
                document.getElementById(
                    "passwordError"
                );


            const email =
                emailInput
                    ? emailInput.value.trim()
                    : "";


            const password =
                passwordInput
                    ? passwordInput.value
                    : "";


            /* Clear errors */

            if (emailError) {
                emailError.textContent = "";
            }

            if (passwordError) {
                passwordError.textContent = "";
            }


            /* Validate email */

            if (!email) {

                if (emailError) {
                    emailError.textContent =
                        "Email is required.";
                }

                return;
            }


            if (!isValidEmail(email)) {

                if (emailError) {
                    emailError.textContent =
                        "Please enter a valid email address.";
                }

                return;
            }


            /* Validate password */

            if (!password) {

                if (passwordError) {
                    passwordError.textContent =
                        "Password is required.";
                }

                return;
            }


            /* Login */

            const result =
                loginUser(
                    email,
                    password
                );


            if (!result.success) {

                showToast(
                    result.message
                );

                return;
            }


            /* --------------------------------
               ADMIN
               -------------------------------- */

            if (
                result.role === "admin"
            ) {

                /*
                   This merged Member 1 page is
                   designed for Resident UI.

                   Admin pages can later use
                   requireAdmin().
                */

                showToast(
                    "Admin login successful."
                );

                return;
            }


            /* --------------------------------
               RESIDENT
               -------------------------------- */

            showDashboard();

        }
    );
}


/* =========================================================
   PROFILE FORM
   ========================================================= */

function initializeProfileForm() {

    const profileForm =
        document.getElementById(
            "profileForm"
        );


    if (!profileForm) {
        return;
    }


    profileForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            updateProfile();

        }
    );
}


/* =========================================================
   EDIT BUTTON
   ========================================================= */

function initializeEditButton() {

    const editButton =
        document.getElementById(
            "editButton"
        );


    if (!editButton) {
        return;
    }


    editButton.addEventListener(
        "click",
        function () {

            enableProfileEdit();

        }
    );
}


/* =========================================================
   CANCEL BUTTON
   ========================================================= */

function initializeCancelButton() {

    const cancelButton =
        document.getElementById(
            "cancelButton"
        );


    if (!cancelButton) {
        return;
    }


    cancelButton.addEventListener(
        "click",
        function () {

            cancelProfileEdit();

        }
    );
}


/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */

function initializeApplication() {

    initializeLoginForm();

    initializeProfileForm();

    initializeEditButton();

    initializeCancelButton();


    const session =
        getSession();


    /* -----------------------------------------
       No active session
       ----------------------------------------- */

    if (!session) {

        showLogin();

        return;
    }


    /* -----------------------------------------
       Resident session
       ----------------------------------------- */

    if (
        session.role === "resident"
    ) {

        const user =
            getCurrentUser();


        if (!user) {

            clearSession();

            showLogin();

            return;
        }


        if (
            user.status &&
            user.status.toLowerCase() ===
            "disabled"
        ) {

            clearSession();

            showToast(
                "Your account has been disabled."
            );

            showLogin();

            return;
        }


        showDashboard();

        return;
    }


    /* -----------------------------------------
       Admin session
       ----------------------------------------- */

    if (
        session.role === "admin"
    ) {

        /*
           Member 1 merged index.html does not
           contain the Admin Dashboard.

           Therefore we keep the admin session
           active without trying to open
           dashboard.html.
        */

        showLogin();

        showToast(
            "Admin session detected. Please use the Admin module."
        );

        return;
    }


    /* -----------------------------------------
       Invalid session
       ----------------------------------------- */

    clearSession();

    showLogin();
}


/* =========================================================
   RUN APPLICATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeApplication();

    }
);