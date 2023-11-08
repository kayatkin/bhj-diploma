/**
 * Класс CreateTransactionForm управляет формой
 * создания новой транзакции
 * */
class CreateTransactionForm extends AsyncForm {
  /**
   * Вызывает родительский конструктор и
   * метод renderAccountsList
   * */
  constructor(element) {
    super(element);
    this.renderAccountsList();
  }

  /**
   * Получает список счетов с помощью Account.list
   * Обновляет в форме всплывающего окна выпадающий список
   * */
  renderAccountsList() {
    if (!User.current()) {
      return;
    }
    Account.list(User.current(), (err, serverData) => {
      if (err) {
        throw new Error("Error");
      }

      if (serverData.success) {
        this.element.querySelector(".accounts-select").innerHTML =
          serverData.data.reduce(
            (sumHTML, account) =>
              sumHTML + `<option value=${account.id}>${account.name}</option>`,
            ""
          );
      }
    });
  }

  /**
   * Создаёт новую транзакцию (доход или расход)
   * с помощью Transaction.create. По успешному результату
   * вызывает App.update(), сбрасывает форму и закрывает окно,
   * в котором находится форма
   * */
  onSubmit(data) {
    Transaction.create(data, (err, serverData) => {
      if (err) {
        throw new Error("Error");
      }
      if (serverData.success) {
        let modalName = this.element.closest(".modal").dataset.modalId;
        this.element.reset();
        App.update();
        App.getModal(modalName).close();
      } else if (!serverData.success) {
        throw new Error("The transaction wasn't created");
      }
    });
  }
}
