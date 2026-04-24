
---

# Codeforces Revision Tracker

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

A full-stack web application that helps you **systematically revise Codeforces problems** using spaced repetition (1-day, 7-day, and 30-day lookbacks).

**Tech Stack:** React, Express, PostgreSQL, Google OAuth
**Goal:** Turn random problem solving into structured long-term retention.

---

## Table of Contents

* [About The Project](#about-the-project)

  * [Built With](#built-with)
* [Getting Started](#getting-started)

  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
* [Usage](#usage)
* [Roadmap](#roadmap)
* [Contributing](#contributing)
* [License](#license)
* [Contact](#contact)
* [Acknowledgments](#acknowledgments)

---

## About The Project

![Product Screenshot][product-screenshot]

This project is built to solve a common competitive programming issue:
**you solve problems, but you don’t actually retain them.**

The Codeforces Revision Tracker automatically syncs your solved problems and organizes them into revision windows:

* **1-day**
* **7-day**
* **30-day**

This enforces spaced repetition, helping you remember techniques, patterns, and edge cases instead of forgetting them after one submission.

### Key Features

* Automatic daily sync of solved problems from Codeforces
* Secure authentication using **Google OAuth**
* Structured revision buckets (1 / 7 / 30 days)
* Persistent storage using **PostgreSQL**
* Modular Express backend
* Clean React frontend

---

## Built With

* **React** – Frontend UI
* **Node.js** – Runtime
* **Express** – Backend framework
* **PostgreSQL** – Relational database
* **Google OAuth** – Authentication

---

## Getting Started

Follow these steps to run the project locally.

---

### Prerequisites

Make sure you have the following installed:

* **Node.js** (v18+ recommended)
* **npm**
* **PostgreSQL**
* A **Google OAuth Client ID**
* A **Codeforces handle**

Update npm:

```sh
npm install npm@latest -g
```

---

### Installation

1. **Clone the repository**

```sh
git clone https://github.com/Harsh-2005d/practiceCF.git
```

2. **Navigate into the project**

```sh
cd practiceCF
```

3. **Install dependencies**

```sh
npm install
```

4. **Create a `.env` file** in the backend directory

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_secret
```

5. **Run database migrations**

```sh
npx prisma migrate dev
```

6. **Start the development server**

```sh
npm run dev
```

---

## Usage

1. Sign in using **Google OAuth**.
2. Link your **Codeforces handle**.
3. The system automatically syncs your solved problems daily.
4. Open the revision dashboard to see:

   * Problems solved **yesterday**
   * Problems solved **7 days ago**
   * Problems solved **30 days ago**
5. Revisit and practice from your revision queue.

This workflow encourages **systematic review instead of one-time problem solving**.

---

## Roadmap

* [ ] Real-time Codeforces API syncing
* [ ] Difficulty filters and problem tagging
* [ ] Personal notes per problem
* [ ] Revision streaks and analytics dashboard
* [ ] Mobile-first UI improvements
* [ ] Exportable revision sets

See the [open issues](https://github.com/Harsh-2005d/practiceCF/issues) for a full list.

---

## Contributing

Contributions are welcome.

If you want to improve the project:

1. Fork the repository
2. Create your branch

```sh
git checkout -b feature/AmazingFeature
```

3. Commit your changes

```sh
git commit -m "Add some AmazingFeature"
```

4. Push to your branch

```sh
git push origin feature/AmazingFeature
```

5. Open a Pull Request

---

## License

Distributed under the **project_license**. See `LICENSE.txt` for more information.

---

## Contact

## Acknowledgments

* Codeforces for the platform and API
* Google OAuth for authentication
* The open-source community

---

## References

[contributors-shield]: https://img.shields.io/github/contributors/Harsh-2005d/practiceCF.svg?style=for-the-badge
[contributors-url]: https://github.com/Harsh-2005d/practiceCF/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Harsh-2005d/practiceCF.svg?style=for-the-badge
[forks-url]: https://github.com/Harsh-2005d/practiceCF/network/members
[stars-shield]: https://img.shields.io/github/stars/Harsh-2005d/practiceCF.svg?style=for-the-badge
[stars-url]: https://github.com/Harsh-2005d/practiceCF/stargazers
[issues-shield]: https://img.shields.io/github/issues/Harsh-2005d/practiceCF.svg?style=for-the-badge
[issues-url]: https://github.com/Harsh-2005d/practiceCF/issues
[license-shield]: https://img.shields.io/github/license/Harsh-2005d/practiceCF.svg?style=for-the-badge
[license-url]: https://github.com/Harsh-2005d/practiceCF/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/LinkedIn-black.svg?style=for-the-badge&logo=linkedin
[linkedin-url]: https://linkedin.com/in/linkedin_username
[product-screenshot]: images/screenshot.png

---
