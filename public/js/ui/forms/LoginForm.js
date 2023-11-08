/**
 * Класс LoginForm управляет формой
 * входа в портал
 * */
class LoginForm extends AsyncForm {
  /**
   * Производит авторизацию с помощью User.login
   * После успешной авторизации, сбрасывает форму,
   * устанавливает состояние App.setState( 'user-logged' ) и
   * закрывает окно, в котором находится форма
   * */
  onSubmit(data) {
    User.login(data, (err, serverData) => {
      if (err) {
        throw new Error("Error");
      }
      if (serverData && serverData.success) {
        this.element.reset();
        App.updateForms();
        App.setState("user-logged");

        let modalName = this.element.closest(".modal").dataset.modalId;
        App.getModal(modalName).close();
      } else {
        alert(
          `Пользователь c email ${data.email} и паролем ${data.password} не найден`
        );
      }
    });
  }
}
