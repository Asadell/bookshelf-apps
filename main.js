const books = [];
const RENDER_EVENT = 'render-bookshelf';
const SAVED_EVENT = 'saved-bookshelf';
const STORAGE_KEY = 'bookshelf-APPS';
const searchBtn = document.getElementById('searchSubmit');

document.addEventListener('DOMContentLoaded', () => {
  const submitForm = document.getElementById('inputBook');
  submitForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addBook();
  });

  if (isStorageExist()) loadDataFromStorage();
});

document.addEventListener(RENDER_EVENT, () => {
  const uncompletedBookShelf = document.getElementById(
    'incompleteBookshelfList'
  );
  uncompletedBookShelf.innerHTML = '';

  const completedBookShelf = document.getElementById('completeBookshelfList');
  completedBookShelf.innerHTML = '';

  for (const bookItem of books) {
    const bookElement = makeBookItem(bookItem);
    if (bookItem.isCompleted) {
      completedBookShelf.append(bookElement);
    } else {
      uncompletedBookShelf.append(bookElement);
    }
  }
});

searchBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const searchTitle = document
    .getElementById('searchBookTitle')
    .value.toLowerCase();
  const bookTitles = document.querySelectorAll('.book_item > h3');

  for (const bookTitle of bookTitles) {
    if (searchBook !== '') {
      if (bookTitle.innerText.toLowerCase().includes(searchTitle)) {
        bookTitle.parentElement.style.display = 'block';
      } else {
        bookTitle.parentElement.style.display = 'none';
      }
    } else {
      bookTitle.parentElement.style.display = 'none';
    }
  }
});

document.addEventListener(SAVED_EVENT, () => {});

function addBook() {
  const title = document.getElementById('inputBookTitle').value;
  const author = document.getElementById('inputBookAuthor').value;
  const year = document.getElementById('inputBookYear').value;
  const isCompleted = document.getElementById('inputBookIsComplete').checked;

  const formBook = document.getElementById('inputBook');
  formBook.reset();

  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    title,
    author,
    Number(year),
    isCompleted
  );
  books.push(bookObject);

  Swal.fire({
    icon: 'success',
    title: 'Berhasil Menambah Data Buku',
    text: `Buku \"${title}\" Berhasil Ditambahkan`,
  });

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
  return { id, title, author, year, isCompleted };
}

function makeBookItem(bookObject) {
  const textTitle = document.createElement('h3');
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement('p');
  textAuthor.innerText = 'Penulis: ' + bookObject.author;

  const textYear = document.createElement('p');
  textYear.innerText = 'Tahun: ' + bookObject.year;

  const yellowButton = document.createElement('button');
  yellowButton.innerText = 'Edit buku';
  yellowButton.classList.add('yellow');

  yellowButton.addEventListener('click', () => {
    editBookById(bookObject.id);
  });

  const redButton = document.createElement('button');
  redButton.innerText = 'Hapus buku';
  redButton.classList.add('red');

  redButton.addEventListener('click', () => {
    removeBookById(bookObject.id);
  });

  const greenButton = document.createElement('button');
  greenButton.classList.add('green');

  if (bookObject.isCompleted) {
    greenButton.innerText = 'Belum selesai dibaca';
    greenButton.addEventListener('click', () => {
      undoBookFromCompleted(bookObject.id);
    });
  } else {
    greenButton.innerText = 'Selesai dibaca';
    greenButton.addEventListener('click', () => {
      addBookToCompleted(bookObject.id);
    });
  }

  const btnContainer = document.createElement('div');
  btnContainer.classList.add('action');
  btnContainer.append(greenButton, redButton, yellowButton);

  const bookContainer = document.createElement('article');
  bookContainer.classList.add('book_item');
  bookContainer.append(textTitle, textAuthor, textYear, btnContainer);
  bookContainer.setAttribute('id', `book-${bookObject.id}`);

  return bookContainer;
}

function findBook(id) {
  for (const book of books) {
    if (book.id === id) return book;
  }
  return null;
}

function findBookIndex(id) {
  for (const index in books) {
    if (books[index].id === id) return index;
  }

  return -1;
}

function removeBookById(id) {
  const bookIndex = findBookIndex(id);

  if (bookIndex === -1) return;

  Swal.fire({
    icon: 'success',
    title: 'Berhasil Menghapus Buku',
    text: `Buku \"${books[bookIndex].title}\" Berhasil Dihapus`,
  });
  books.splice(bookIndex, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addBookToCompleted(id) {
  const bookTarget = findBook(id);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(id) {
  const bookTarget = findBook(id);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    Swal.fire({
      title: 'The Internet?',
      text: "I think your browser doesn't support web storage",
      icon: 'question',
    });
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function editBookById(id) {
  const editSection = document.querySelector('.edit_section');
  editSection.style.display = 'flex';
  const bookTarget = findBook(id);
  if (bookTarget === null) return;

  const editHeader = document.getElementById('book-title');
  editHeader.innerText = bookTarget.title;

  let editTitle = document.getElementById('editBookTitle');
  let editAuthor = document.getElementById('editBookAuthor');
  let editYear = document.getElementById('editBookYear');
  document.getElementById('editBookIsComplete').checked =
    bookTarget.isCompleted;
  let editIsCompleted = document.getElementById('editBookIsComplete');

  editTitle.setAttribute('value', `${bookTarget.title}`);
  editAuthor.setAttribute('value', `${bookTarget.author}`);
  editYear.setAttribute('value', `${bookTarget.year}`);

  const editForm = document.getElementById('bookSubmit');
  editForm.addEventListener('click', (e) => {
    e.preventDefault();
    bookTarget.title = editTitle.value;
    bookTarget.author = editAuthor.value;
    bookTarget.year = editYear.value;
    bookTarget.isCompleted = editIsCompleted.checked;

    Swal.fire({
      icon: 'success',
      title: 'Yeyy',
      text: `Berhasil Mengedit Buku \"${bookTarget.title}\"`,
    });

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    const editForm = document.getElementById('editBook');
    editForm.reset();
    editSection.style.display = 'none';
  });
}
