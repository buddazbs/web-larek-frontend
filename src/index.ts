import './scss/styles.scss';
import { Api } from './components/base/api';
import { EventEmitter } from './components/base/events';
import { AppState } from './models/AppState';
import { MainPage } from './components/MainPage';
import { Card } from './components/Card';
import { Modal } from './components/Modal';
import { BasketView } from './components/BasketView';
import { ContactForm } from './components/ContactForm';
import { DeliveryForm } from './components/DeliveryForm';
import { SuccessMessage } from './components/SuccessMessage';
import { IProduct, IBasketItem } from './types';
import { API_URL } from './utils/constants';

// Инициализация API и событий
const api = new Api(API_URL);
const events = new EventEmitter();

// Инициализация модели
const appState = new AppState(api, events);

// Инициализация компонентов
const mainPage = new MainPage(document.querySelector('.page__wrapper') as HTMLElement);
const modal = new Modal(document.querySelector('#modal-container') as HTMLElement);

// Получаем шаблоны
const cardCatalogTemplate = document.querySelector('#card-catalog') as HTMLTemplateElement;
const cardPreviewTemplate = document.querySelector('#card-preview') as HTMLTemplateElement;
const cardBasketTemplate = document.querySelector('#card-basket') as HTMLTemplateElement;
const basketTemplate = document.querySelector('#basket') as HTMLTemplateElement;
const orderTemplate = document.querySelector('#order') as HTMLTemplateElement;
const contactsTemplate = document.querySelector('#contacts') as HTMLTemplateElement;
const successTemplate = document.querySelector('#success') as HTMLTemplateElement;

// Объявляем basketView на верхнем уровне
let basketView: BasketView;

// Создаем компоненты карточек
const cardCatalog = new Card(cardCatalogTemplate, (event) => {
	const cardElement = event.currentTarget as HTMLElement;
	const productId = cardElement.dataset.id;
	if (productId) {
		const product = appState.getCatalog().find(p => p.id === productId);
		if (product) {
			appState.setPreview(product);
		}
	}
});

const cardPreview = new Card(cardPreviewTemplate, (event) => {
	const target = event.target as HTMLElement;
	if (target && target.classList.contains('card__button')) {
		const product = appState.getPreview();
		if (product && appState.canAddToBasket(product)) {
			if (appState.isInBasket(product.id)) {
				appState.removeFromBasket(product.id);
			} else {
				appState.addToBasket(product);
			}
			// После добавления/удаления товара просто закрываем модалку карточки, корзину не открываем
			modal.close();
		}
	}
});

const cardBasket = new Card(cardBasketTemplate);

// Создаем компоненты форм из шаблонов
const deliveryForm = new DeliveryForm(orderTemplate.content.cloneNode(true) as HTMLElement);
const contactForm = new ContactForm(contactsTemplate.content.cloneNode(true) as HTMLElement);
const successMessage = new SuccessMessage(successTemplate.content.cloneNode(true) as HTMLElement);

// Инициализация basketView после получения элемента из шаблона
const basketFragment = basketTemplate.content.cloneNode(true) as DocumentFragment;
const basketElement = basketFragment.querySelector('.basket') as HTMLElement;
basketView = new BasketView(basketElement);

// Обработчики событий
events.on('catalog:loaded', (products: IProduct[]) => {
	try {
		const cards = products.map(product => {
			const cardElement = cardCatalog.renderGallery(product);
			(cardElement as HTMLElement).dataset.id = product.id;
			return cardElement;
		});
		mainPage.renderGallery(cards);
	} catch (err) {
		console.error('[index.ts] Ошибка при рендере карточек', err);
	}
});

events.on('catalog:error', (error: any) => {
	console.error('Ошибка загрузки каталога:', error);
	// Можно добавить отображение ошибки пользователю
	const galleryContainer = document.querySelector('.gallery') as HTMLElement;
	if (galleryContainer) {
		galleryContainer.innerHTML = '<p class="error">Ошибка загрузки каталога товаров</p>';
	}
});

events.on('preview:changed', (product: IProduct | null) => {
	if (product) {
		const isInBasket = appState.isInBasket(product.id);
		const previewCard = cardPreview.renderPreview(product, isInBasket);
		modal.open(previewCard);
	}
});

// Обработчик события изменения корзины
// Обновляем только счетчик в шапке и, если открыта модалка корзины, динамически добавляем/удаляем товары
events.on('basket:changed', (items: IBasketItem[]) => {
	mainPage.setBasketCount(items.length);
	if (modal.isOpen()) {
		const basketItems = items.map((item) => {
			const card = cardBasket.renderBasket(item);
			card.setAttribute('data-id', item.id);
			card.classList.add('basket__item');
			return card;
		});
		basketView.renderBasket(basketItems, appState.getBasketTotal());
		modal.setContent(basketView.render());
	}
});

// Обработчик клика на корзину в шапке
mainPage.setBasketClickHandler(() => {
	const basket = appState.getBasket();
	const basketItems = basket.map(item => {
		const card = cardBasket.renderBasket(item);
		card.setAttribute('data-id', item.id);
		card.classList.add('basket__item');
		return card;
	});
	basketView.renderBasket(basketItems, appState.getBasketTotal());
	const basketContent = basketView.render();
	modal.open(basketContent);
});

// Обработчик оформления заказа из корзины
basketView.setOrderHandler(() => {
    // Перед открытием формы доставки корзина НЕ очищается!
    // Данные для заказа всегда берутся из appState
    const deliveryContent = deliveryForm.render();
    modal.open(deliveryContent);
});

// Обработчик отправки формы доставки
// После возврата из формы доставки всегда пересоздаём корзину

deliveryForm.setSubmitHandler(() => {
    const { address, payment } = deliveryForm.getData();
    appState.setOrderField('address', address);
    appState.setOrderField('payment', payment);
    // Передаём в форму контактов только после сохранения данных в appState
    const contactContent = contactForm.render();
    modal.open(contactContent);
});

// При возврате к корзине из любой формы всегда рендерим корзину заново
function openBasketModal() {
    // Берём актуальное состояние корзины из appState
    const basket = appState.getBasket();
    const basketItems = basket.map(item => {
        const card = cardBasket.renderBasket(item);
        card.setAttribute('data-id', item.id);
        card.classList.add('basket__item');
        return card;
    });
    basketView.renderBasket(basketItems, appState.getBasketTotal());
    const basketContent = basketView.render();
    modal.open(basketContent);
}

// Используйте openBasketModal() для возврата к корзине, если потребуется

// Обработчик отправки формы контактов
contactForm.setSubmitHandler(async () => {
    const { email, phone } = contactForm.getData();
    appState.setOrderField('email', email);
    appState.setOrderField('phone', phone);

    const errors: Record<string, string> = {};
    errors.email = appState.validateEmail(email) || '';
    errors.phone = appState.validatePhone(phone) || '';
    contactForm.showErrors(errors);
    const isValid = !errors.email && !errors.phone;
    contactForm.setSubmitDisabled(!isValid);

    if (isValid) {
        // Перед отправкой заказа корзина НЕ очищается
        const success = await appState.submitOrder();
        if (!success) {
            // Можно показать общую ошибку заказа
        }
    }
});

// Немедленная валидация при вводе
contactForm.setInputHandler(() => {
	const { email, phone } = contactForm.getData();
	const errors: Record<string, string> = {};
	errors.email = appState.validateEmail(email) || '';
	errors.phone = appState.validatePhone(phone) || '';
	contactForm.showErrors(errors);
	const isValid = !errors.email && !errors.phone;
	contactForm.setSubmitDisabled(!isValid);
});

// Обработчик закрытия сообщения об успехе
successMessage.setCloseHandler(() => {
	modal.close();
});

// Обработчик удаления товара из корзины
document.addEventListener('basket:remove', ((event: CustomEvent) => {
	const { id } = event.detail;
	appState.removeFromBasket(id);
}) as EventListener);

// Окно успешной оплаты
// Показываем модалку при успешном заказе

events.on('order:success', (total: number) => {
    // Очищаем корзину только после успешного заказа!
    appState.clearBasket && appState.clearBasket();
    successMessage.show(total);
    modal.open(successMessage.render());
});

// Загружаем каталог при запуске
appState.loadCatalog();
