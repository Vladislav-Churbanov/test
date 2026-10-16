import { useState } from "react";
import type { FormEvent } from "react";
import "./App.css";

interface Service {
  id: number;
  name: string;
  price: number;
}

interface ServiceItem {
  service: Service;
  quantity: number;
}

const availableServices: Service[] = [
  { id: 1, name: "Разработка лендинга", price: 50000 },
  { id: 2, name: "Интернет-магазин", price: 150000 },
  { id: 3, name: "Корпоративный портал", price: 300000 },
  { id: 4, name: "SEO-оптимизация", price: 20000 },
];

const formatPrice = (price: number) => `${price.toLocaleString("ru-RU")} ₽`;

export default function ProjectBuilder() {
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | "">("");
  // Preserve an empty field while the user edits the quantity.
  const [quantity, setQuantity] = useState("1");
  const numericQuantity = Number(quantity);
  const isQuantityValid =
    quantity.trim() !== "" &&
    Number.isInteger(numericQuantity) &&
    numericQuantity >= 1 &&
    numericQuantity <= 10;

  const totalPrice = selectedServices.reduce(
    (total, item) => total + item.service.price * item.quantity,
    0,
  );

  function addService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const service = availableServices.find(
      (service) => service.id === selectedServiceId,
    );
    if (!service || !isQuantityValid) return;

    setSelectedServices((previous) => {
      const exists = previous.some((item) => item.service.id === service.id);
      return exists
        ? previous.map((item) =>
            item.service.id === service.id
              ? { ...item, quantity: item.quantity + numericQuantity }
              : item,
          )
        : [...previous, { service, quantity: numericQuantity }];
    });
  }

  function removeService(serviceId: number) {
    setSelectedServices((previous) =>
      previous.filter((item) => item.service.id !== serviceId),
    );
  }

  return (
    <main className="project-builder">
      <h1>Состав проекта</h1>
      <p className="intro">
        Выберите услуги и укажите количество, чтобы рассчитать стоимость
        проекта.
      </p>

      <form className="add-service" onSubmit={addService}>
        <label className="service-field">
          Услуга
          <select
            required
            value={selectedServiceId}
            onChange={(event) =>
              setSelectedServiceId(
                event.target.value === "" ? "" : Number(event.target.value),
              )
            }
          >
            <option value="" disabled>
              Выберите услугу
            </option>
            {availableServices.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} — {formatPrice(service.price)}
              </option>
            ))}
          </select>
        </label>
        <label className="quantity-field">
          Количество
          <input
            type="number"
            min={1}
            max={10}
            step={1}
            required
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            aria-invalid={!isQuantityValid}
            aria-describedby="quantity-hint"
          />
        </label>
        <button
          type="submit"
          disabled={selectedServiceId === "" || !isQuantityValid}
        >
          Добавить
        </button>
      </form>
      <p id="quantity-hint" className={isQuantityValid ? "hint" : "hint error"}>
        Введите целое число от 1 до 10. Повторное добавление увеличивает
        количество услуги.
      </p>

      {selectedServices.length > 0 ? (
        <div className="table-scroll">
          <table className="services-table">
            <caption className="sr-only">
              Выбранные услуги и стоимость проекта
            </caption>
            <thead>
              <tr>
                <th scope="col">Услуга</th>
                <th scope="col">Цена за ед.</th>
                <th scope="col">Кол-во</th>
                <th scope="col">Сумма</th>
                <th scope="col">
                  <span className="sr-only">Действия</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {selectedServices.map((item) => (
                <tr key={item.service.id}>
                  <th scope="row">{item.service.name}</th>
                  <td className="money">{formatPrice(item.service.price)}</td>
                  <td>{item.quantity}</td>
                  <td className="money">
                    {formatPrice(item.service.price * item.quantity)}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="remove-button"
                      aria-label={`Удалить: ${item.service.name}`}
                      onClick={() => removeService(item.service.id)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" colSpan={3}>
                  Итого:
                </th>
                <td colSpan={2} className="money" aria-live="polite">
                  {formatPrice(totalPrice)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <p className="empty-state">Пока не добавлено ни одной услуги</p>
      )}
    </main>
  );
}
