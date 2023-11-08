/**
 * Класс TransactionsPage управляет
 * страницей отображения доходов и
 * расходов конкретного счёта
 * */
class TransactionsPage {
  /**
   * Если переданный элемент не существует,
   * необходимо выкинуть ошибку.
   * Сохраняет переданный элемент и регистрирует события
   * через registerEvents()
   * */
  constructor(element) {
    if (!element) {
      throw new Error("Элемент не существует");
    }
    this.element = element;
    this.registerEvents();
  }

  /**
   * Вызывает метод render для отрисовки страницы
   * */
  update() {
    if (!this.lastOptions) {
      return;
    }
    this.render(this.lastOptions);
  }

  /**
   * Отслеживает нажатие на кнопку удаления транзакции
   * и удаления самого счёта. Внутри обработчика пользуйтесь
   * методами TransactionsPage.removeTransaction и
   * TransactionsPage.removeAccount соответственно
   * */
  registerEvents() {
    this.element
      .querySelector(".remove-account")
      .addEventListener("click", (e) => {
        this.removeAccount();
      });

    this.element.addEventListener("click", (e) => {
      if (
        e.target.classList.contains("transaction__remove") ||
        e.target.closest(".transaction__remove")
      ) {
        this.removeTransaction(
          e.target.dataset.id ||
            e.target.closest(".transaction__remove").dataset.id
        );
      }
    });
  }

  /**
   * Удаляет счёт. Необходимо показать диаголовое окно (с помощью confirm())
   * Если пользователь согласен удалить счёт, вызовите
   * Account.remove, а также TransactionsPage.clear с
   * пустыми данными для того, чтобы очистить страницу.
   * По успешному удалению необходимо вызвать метод App.updateWidgets() и App.updateForms(),
   * либо обновляйте только виджет со счетами и формы создания дохода и расхода
   * для обновления приложения
   * */
  removeAccount() {
    const answer = confirm("Вы действительно хотите удалить счёт?");
    if (answer) {
      this.clear();
      Account.remove(
        { id: document.querySelector(".active").dataset.id },
        (err, serverData) => {
          if (err) {
            throw new Error("Error");
          }
          if (serverData.success) {
            App.updateWidgets();
            App.updateForms();
          } else if (!serverData.success) {
            throw new Error("The account wasn't deleted");
          }
        }
      );
    }
  }

  /**
   * Удаляет транзакцию (доход или расход). Требует
   * подтверждеия действия (с помощью confirm()).
   * По удалению транзакции вызовите метод App.update(),
   * либо обновляйте текущую страницу (метод update) и виджет со счетами
   * */
  removeTransaction(id) {
    const answer = confirm("Вы действительно хотите удалить эту транзакцию?");
    if (answer) {
      Transaction.remove({ id: id }, (err, serverData) => {
        if (err) {
          throw new Error("Error");
        }
        if (serverData.success) {
          App.updateWidgets();
          this.update();

          //App.update();
        } else if (!serverData.success) {
          throw new Error("Transaction wasn't deleted");
        }
      });
      App.update();
    }
  }

  /**
   * С помощью Account.get() получает название счёта и отображает
   * его через TransactionsPage.renderTitle.
   * Получает список Transaction.list и полученные данные передаёт
   * в TransactionsPage.renderTransactions()
   * */
  render(options) {
    if (options === null) {
      return;
    }

    Account.get(options.account_id, (err, serverData) => {
      if (err) {
        throw new Error("Error");
      }
      if (serverData && serverData.success) {
        this.renderTitle(serverData.data.name);
      } else {
        throw new Error("The account name is undefined");
      }
    });

    Transaction.list({ account_id: options.account_id }, (err, serverData) => {
      if (err) {
        throw new Error("Error");
      }
      if (serverData && serverData.success) {
        this.renderTransactions(serverData.data);
      } else {
        throw new Error("The accounts are undefined");
      }
    });
    this.lastOptions = options;
  }

  /**
   * Очищает страницу. Вызывает
   * TransactionsPage.renderTransactions() с пустым массивом.
   * Устанавливает заголовок: «Название счёта»
   * */
  clear() {
    document.querySelector(".content-title").textContent = "Название счёта";
    this.lastOptions = null;
    this.renderTransactions([]);
  }

  /**
   * Устанавливает заголовок в элемент .content-title
   * */
  renderTitle(name) {
    document.querySelector(".content-title").textContent = name;
  }

  /**
   * Форматирует дату в формате 2019-03-10 03:20:41 (строка)
   * в формат «10 марта 2019 г. в 03:20»
   * */
  formatDate(date) {
    const dateObject = new Date(date);

    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    const formattedDate = dateObject.toLocaleString("ru", options);
    const time = dateObject.toLocaleTimeString("ru", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${formattedDate} г. в ${time}`;
  }

  /**
   * Формирует HTML-код транзакции (дохода или расхода).
   * item - объект с информацией о транзакции
   * */
  getTransactionHTML(item) {
    if (item.length === 0) {
      this.element.querySelector(".content").innerHTML = "";
      return;
    }

    const newTransaction = document.createElement("div");
    this.element.querySelector(".content").appendChild(newTransaction);
    return newTransaction.insertAdjacentHTML(
      "beforeend",
      `<div class="transaction transaction_${item.type} row">
     <div class="col-md-7 transaction__details">
       <div class="transaction__icon">
           <span class="fa fa-money fa-2x"></span>
       </div>
       <div class="transaction__info">
           <h4 class="transaction__title">${item.name}</h4>
           <div class="transaction__date">${this.formatDate(
             item.created_at
           )}</div>
       </div>
     </div>
     <div class="col-md-3">
       <div class="transaction__summ">
           ${item.sum} <span class="currency">₽</span>
       </div>
     </div>
     <div class="col-md-2 transaction__controls">
         <button class="btn btn-danger transaction__remove" data-id="${
           item.id
         }">
             <i class="fa fa-trash"></i>
         </button>
     </div>
 </div>`
    );
  }

  /**
   * Отрисовывает список транзакций на странице
   * используя getTransactionHTML
   * */
  renderTransactions(data) {
    this.getTransactionHTML([]);
    if (data.length === 0) {
      this.getTransactionHTML(data);
    }
    for (let item of data) {
      this.getTransactionHTML(item);
    }
  }
}
