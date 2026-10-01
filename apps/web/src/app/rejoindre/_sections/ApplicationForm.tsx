"use client";

import { useState, type FormEvent } from "react";
import button from "@/components/ui/button.module.css";
import { joinApplication } from "@/content/join";
import { submitApplication } from "@/data/applications";
import type {
  ApplicantStatus,
  ApplicationField,
  MembershipApplication,
} from "@/types/application";
import styles from "./ApplicationForm.module.css";

type Errors = Partial<Record<ApplicationField, string>>;
type Outcome = "idle" | "sending" | "sent" | "not-connected";

const { fields, statuses, errors: messages } = joinApplication;
const statusValues = Object.keys(statuses) as ApplicantStatus[];

function text(data: FormData, name: ApplicationField) {
  const value = data.get(name);
  return typeof value === "string" ? value.trim() : "";
}

/** Lit le formulaire et dit ce qui manque, champ par champ. */
function read(data: FormData): { errors: Errors; application?: MembershipApplication } {
  const errors: Errors = {};
  const firstName = text(data, "firstName");
  const lastName = text(data, "lastName");
  const email = text(data, "email");
  const phone = text(data, "phone");
  const status = text(data, "status") as ApplicantStatus | "";
  const cv = data.get("cv");

  if (!firstName) errors.firstName = messages.firstName;
  if (!lastName) errors.lastName = messages.lastName;
  if (!email) errors.email = messages.email;
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = messages.emailFormat;
  if (!phone) errors.phone = messages.phone;
  else if (phone.replace(/\D/g, "").length < 8) errors.phone = messages.phoneFormat;
  if (!status) errors.status = messages.status;
  if (!(cv instanceof File) || cv.size === 0) errors.cv = messages.cv;

  if (Object.keys(errors).length > 0 || !status || !(cv instanceof File)) {
    return { errors };
  }

  return { errors, application: { firstName, lastName, email, phone, status, cv } };
}

export function ApplicationForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [outcome, setOutcome] = useState<Outcome>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const result = read(new FormData(form));
    setErrors(result.errors);

    if (!result.application) {
      setOutcome("idle");
      // Le focus va au premier champ en erreur, dans l'ordre du formulaire.
      const first = (Object.keys(fields) as ApplicationField[]).find(
        (name) => result.errors[name],
      );
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setOutcome("sending");
    const submission = await submitApplication(result.application);
    setOutcome(submission.ok ? "sent" : "not-connected");
  }

  /** Attributs communs d'un champ : son erreur lui est reliée. */
  function describe(name: ApplicationField, hintId?: string) {
    const ids = [errors[name] ? `${name}-erreur` : null, hintId].filter(Boolean);

    return {
      "aria-invalid": errors[name] ? true : undefined,
      "aria-describedby": ids.length > 0 ? ids.join(" ") : undefined,
    };
  }

  function errorOf(name: ApplicationField) {
    return errors[name] ? (
      <p id={`${name}-erreur`} className={styles.error}>
        <strong>{joinApplication.errorPrefix} :</strong> {errors[name]}
      </p>
    ) : null;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <p className={styles.hint}>{joinApplication.required}</p>

      <div className={styles.pair}>
        <div className={styles.field}>
          <label htmlFor="firstName">{fields.firstName}</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            {...describe("firstName")}
          />
          {errorOf("firstName")}
        </div>
        <div className={styles.field}>
          <label htmlFor="lastName">{fields.lastName}</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            required
            {...describe("lastName")}
          />
          {errorOf("lastName")}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="email">{fields.email}</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          {...describe("email")}
        />
        {errorOf("email")}
      </div>

      <div className={styles.field}>
        <label htmlFor="phone">{fields.phone}</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          {...describe("phone")}
        />
        {errorOf("phone")}
      </div>

      <fieldset
        role="radiogroup"
        aria-required="true"
        className={styles.group}
        {...describe("status")}
      >
        <legend>{fields.status}</legend>
        <div className={styles.choices}>
          {statusValues.map((value) => (
            <label key={value} className={styles.choice}>
              <input type="radio" name="status" value={value} required />
              {statuses[value]}
            </label>
          ))}
        </div>
        {errorOf("status")}
      </fieldset>

      <div className={styles.field}>
        <label htmlFor="cv">{fields.cv}</label>
        <div className={styles.drop}>
          <input
            id="cv"
            name="cv"
            type="file"
            accept=".pdf,.doc,.docx"
            required
            {...describe("cv", "cv-aide")}
          />
        </div>
        <p id="cv-aide" className={styles.hint}>
          {joinApplication.cvHint}
        </p>
        {errorOf("cv")}
      </div>

      {/* Ce qui se passe après l'envoi est écrit avant le bouton. */}
      <p className={styles.after}>
        <strong>{joinApplication.afterTitle}</strong> {joinApplication.after}
      </p>

      <button
        type="submit"
        className={`${button.button} ${button.primary} ${styles.submit}`}
        disabled={outcome === "sending"}
      >
        {joinApplication.submit}
      </button>

      <div role="status" className={styles.outcome}>
        {outcome === "not-connected" ? (
          <>
            <p className={styles.outcomeTitle}>
              {joinApplication.notConnectedTitle}
            </p>
            <p>{joinApplication.notConnected}</p>
          </>
        ) : null}
        {outcome === "sent" ? (
          <>
            <p className={styles.outcomeTitle}>{joinApplication.sentTitle}</p>
            <p>{joinApplication.sent}</p>
          </>
        ) : null}
      </div>
    </form>
  );
}
