import { ChallengeData } from "../models/ChallengeData";
import { Calendar } from "../models/ChallengeData";
import { Action } from "../models/ChallengeData";
import { Vendor } from "../models/ChallengeData";
import { Customer } from "../models/ChallengeData";

export async function fetchDataFromAPI(): Promise<ChallengeData> {
  const response = await fetch('https://xjvq5wtiye.execute-api.us-east-1.amazonaws.com/interview/api/v1/challenge');
  if (!response.ok) {
    throw new Error('Network response was not ok ' + response.statusText);
  }
  const data = await response.json();
  return mapDataToChallengeData(data);
}

function mapDataToChallengeData(data: any): ChallengeData {
  return {
    id: data.id,
    created: data.created,
    deleted: data.deleted,
    status: data.status,
    customer: mapCustomer(data.customer),
    calendar: data.calendar.map((calendarItem: any) => mapCalendar(calendarItem))
  };
}

function mapCustomer(data: any): Customer {
  return {
    id: data.id,
    city: data.city,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    phoneNumber: data.phoneNumber,
    state: data.state,
    street: data.street,
    zip: data.zip
  };
}

function mapCalendar(data: any): Calendar {
  return {
    month: data.month,
    year: data.year,
    actions: data.actions.map((actionItem: any) => mapAction(actionItem))
  };
}

function mapAction(data: any): Action {
  return {
    id: data.id,
    arrivalEndWindow: data.arrivalEndWindow,
    arrivalStartWindow: data.arrivalStartWindow,
    name: data.name,
    price: data.price,
    scheduledDate: data.scheduledDate,
    status: data.status,
    vendor: data.vendor ? mapVendor(data.vendor) : undefined
  };
}

function mapVendor(data: any): Vendor {
  return {
    id: data.id,
    city: data.city,
    emailAddress: data.emailAddress,
    firstName: data.firstName,
    lastName: data.lastName,
    phoneNumber: data.phoneNumber,
    state: data.state,
    streetAddress: data.streetAddress,
    vendorName: data.vendorName,
    zip: data.zip
  };
}
