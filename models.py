from dataclasses import dataclass
from datetime import date
from enum import Enum
from typing import List, Optional

class ProductType(Enum):
    PENSION = "pension"
    INSURANCE = "insurance"
    INVESTMENT = "investment"
    POLICY = "policy"

@dataclass
class PersonalInfo:
    id_number: str
    first_name: str
    last_name: str
    birth_date: date
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

@dataclass
class InsuranceProduct:
    company: str
    product_type: ProductType
    policy_number: str
    start_date: date
    end_date: Optional[date] = None
    premium: Optional[float] = None
    coverage_amount: Optional[float] = None
    status: str = "active"

@dataclass
class PensionProduct:
    company: str
    product_type: ProductType
    policy_number: str
    start_date: date
    salary: float
    contribution_rate: float
    employer_contribution: Optional[float] = None
    employee_contribution: Optional[float] = None
    status: str = "active"

@dataclass
class Client:
    personal_info: PersonalInfo
    insurance_products: List[InsuranceProduct]
    pension_products: List[PensionProduct]
    created_at: date
    updated_at: date
    status: str = "active"
    notes: Optional[str] = None
