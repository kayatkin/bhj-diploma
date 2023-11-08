/**
 * Класс RegisterForm управляет формой
 * регистрации
 * */
class RegisterForm extends AsyncForm {
  /**
   * Производит регистрацию с помощью User.register
   * После успешной регистрации устанавливает
   * состояние App.setState( 'user-logged' )
   * и закрывает окно, в котором находится форма
   * */
  onSubmit(data) {
    User.register(data, (err, serverData) => {
      if (err) {
        throw new Error("Error");
      }
      if (data.password.length < 3) {
        alert(`Количество символов в поле Пароль должно быть не менее 3.`);
        return;
      }
      if (serverData.success) {
        User.setCurrent(serverData.user);
        App.setState("user-logged");

        let modalName = this.element.closest(".modal").dataset.modalId;
        App.getModal(modalName).close();
      } else {
        throw new Error("Пользователь не зарегистрирован");
      }
    });
  }
}
