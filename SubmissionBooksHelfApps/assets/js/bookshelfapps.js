const buku = [];
const RENDER_EVENT = 'render-buku';
const SAVED_EVENT = 'saved-buku';
const STORAGE_KEY = 'BOOKSHELF_APPS';
document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('form');
    const inputSearchBook = document.getElementById("searchBook");
    const inputTahun=document.getElementById('tahun');
    inputTahun.addEventListener('keyup', function(event){
      event.preventDefault();
      hanyaAngkaSajaBoleh();
    });

    inputSearchBook.addEventListener("submit", function (event) {
        event.preventDefault();
        searchBook();
    });
    inputSearchBook.addEventListener("keyup", function (event) {
        event.preventDefault();
        searchBook();
    });

    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        let saveData=confirm("Simpan Data ke Local Storage?");
            if(saveData)
            {
                addBook();
                hapusDataForm();
            }
    });

    if (isStorageExist()) {
      loadDataFromStorage();
    }
});
function hapusDataForm() {
    let inputData=document.querySelectorAll('input');
    console.log(inputData);
    for(let data of inputData)
    {
        data.value="";
    }
} 

function addBook() {
    const judul = document.getElementById('judul').value;
    const penulis = document.getElementById('penulis').value;
    const tahun = document.getElementById('tahun').value;
   
    const generatedID = generateId();
    const objectBuku = generateObjectBuku(generatedID, judul, penulis, tahun, false);
    buku.push(objectBuku);
   
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}

function generateObjectBuku(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted
    }
}

document.addEventListener(RENDER_EVENT, function () {
    const uncompletedBookList = document.getElementById('new-buku');
    uncompletedBookList.innerHTML = '';
   
    const completedBookList = document.getElementById('completed-buku');
    completedBookList.innerHTML = '';

    for (const bukuItem of buku) {
        const bukuElement = makeBuku(bukuItem);
        if (!bukuItem.isCompleted)
            uncompletedBookList.append(bukuElement);
        else
            completedBookList.append(bukuElement);
    }
});


function makeBuku(objectBuku) {
    const textTitle = document.createElement('h2');
    textTitle.innerText = objectBuku.title;
    const textKeterangan = document.createElement('p');
    textKeterangan.innerText = "Penulis - "+ objectBuku.author + ", Terbit Tahun - "+objectBuku.year;
   
    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(textTitle, textKeterangan);
   
    const container = document.createElement('div');
    container.classList.add('item');
    container.append(textContainer);
    container.setAttribute('id', `buku-${objectBuku.id}`);

    if (objectBuku.isCompleted) {
        const undoButton = document.createElement('button');
        undoButton.innerText="Belum Baca"
        undoButton.classList.add('undo-button');
     
        undoButton.addEventListener('click', function () {
            undoTaskFromCompleted(objectBuku.id);
        });
     
        const trashButton = document.createElement('button');
        trashButton.innerText="Hapus"
        trashButton.classList.add('trash-button');
     
        trashButton.addEventListener('click', function () {
            let hapusData=confirm("Yakin data akan dihapus?");
            if(hapusData)
            {
                removeBukuFromCompleted(objectBuku.id);
            }
        });
     
        textContainer.append(undoButton, trashButton);
      } else {
        const finishButton = document.createElement('button');
        finishButton.classList.add('btn-cek');
        finishButton.innerText="Selesai"
        finishButton.addEventListener('click', function () {
          addBukuToCompleted(objectBuku.id);
        });

        const trashButton = document.createElement('button');
        trashButton.innerText="Hapus"
        trashButton.classList.add('trash-button');
     
        trashButton.addEventListener('click', function () {
            let hapusData=confirm("Yakin data akan dihapus?");
            if(hapusData)
            {
                removeBukuFromCompleted(objectBuku.id);
            }
        });

        textContainer.append(finishButton, trashButton);
      }

    return container;
  }

  function addBukuToCompleted (bukuId) {
    const targetBuku = findBuku(bukuId);
   
    if (targetBuku == null) return;
    targetBuku.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function searchBook() {
        const searchBook = document.getElementById("carijudul");
        const filter = searchBook.value.toUpperCase();
        const bookItem = document.querySelectorAll(".item");
        for (let i = 0; i < bookItem.length; i++) {
            txtValue = bookItem[i].textContent || bookItem[i].innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                bookItem[i].style.display = "";
            } else {
                bookItem[i].style.display = "none";
            }
        }
  }

  function findBuku(bukuId) {
    for (const bukuItem of buku) {
      if (bukuItem.id === bukuId) {
        return bukuItem;
      }
    }
    return null;
  }

  function removeBukuFromCompleted(bukuId) {
    const targetBuku = findIndexBuku(bukuId);
   
    if (targetBuku === -1) return;
   
    buku.splice(targetBuku, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function undoTaskFromCompleted(bukuId) {
    const targetBuku = findBuku(bukuId);
   
    if (targetBuku == null) return;
   
    targetBuku.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function findIndexBuku(bukuId) {
    for (const index in buku) {
      if (buku[index].id === bukuId) {
        return index;
      }
    }
   
    return -1;
  }


  function saveData() {
    if (isStorageExist()) {
      const parsed = JSON.stringify(buku);
      localStorage.setItem(STORAGE_KEY, parsed);

      document.dispatchEvent(new Event(SAVED_EVENT));
    }
  }

  function isStorageExist() {
    if (typeof (Storage) === undefined) {
      alert('Browser kamu tidak mendukung local storage');
      return false;
    }
    return true;
  }

  document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
  });


  function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData) ;
  
    if (data !== null) {
      for (const databuku of data) {
        buku.push(databuku);
      }
    }
   
    document.dispatchEvent(new Event(RENDER_EVENT));
  }

  function hanyaAngkaSajaBoleh(){
    var validasiAngka = /^[0-9]+$/;
    var tahunLahir = document.getElementById("tahun");
    if (tahunLahir.value.match(validasiAngka)) {
    } 
    else {
      tahunLahir.value="";
      tahunLahir.focus();
      return false;
    }
  }

  