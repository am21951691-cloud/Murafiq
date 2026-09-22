import { storageAdapter, type StoredDepartment } from "./storage-adapter";
import type {
  TenantBranding,
  TenantSlaConfig,
  InstitutionStaffMember,
  SectorType,
  InstitutionStaffRole,
} from "@/types/database";
import { getSectorConfig } from "@/lib/config/sectors";
import { getSectorTaxonomy } from "@/lib/config/taxonomies";

export interface TenantOverview {
  institutionId: string;
  name: string;
  sector: SectorType;
  branding: TenantBranding;
  slaConfig: TenantSlaConfig;
  departments: StoredDepartment[];
  staffCount: number;
  activeCasesCount: number;
}

export class TenantAdminService {
  public async getTenantOverview(
    institutionId: string,
    sector: SectorType = "EDUCATION_SCHOOLS"
  ): Promise<TenantOverview> {
    const branding = (await storageAdapter.getTenantBranding(institutionId)) || {
      primary_color: "#0F766E",
      institution_short_name: "مُرافِق المؤسسي",
    };

    const slaConfig = await storageAdapter.getTenantSlaConfig(institutionId);
    const departments = await storageAdapter.getDepartments(institutionId, sector);
    const staff = await storageAdapter.getStaffMembers(institutionId);
    const cases = await storageAdapter.listCases({ institutionId });

    const activeCases = cases.filter(
      (c) => c.lifecycle_status !== "CLOSED" && c.lifecycle_status !== "ARCHIVED"
    );

    return {
      institutionId,
      name: branding.institution_short_name || "المؤسسة",
      sector,
      branding,
      slaConfig,
      departments,
      staffCount: staff.length,
      activeCasesCount: activeCases.length,
    };
  }

  public async updateBranding(
    institutionId: string,
    branding: Partial<TenantBranding>
  ): Promise<TenantBranding> {
    return storageAdapter.saveTenantBranding(institutionId, branding);
  }

  public async updateSlaConfig(
    institutionId: string,
    config: Partial<TenantSlaConfig>
  ): Promise<TenantSlaConfig> {
    return storageAdapter.saveTenantSlaConfig(institutionId, config);
  }

  public async getDepartments(
    institutionId: string,
    sector?: SectorType
  ): Promise<StoredDepartment[]> {
    return storageAdapter.getDepartments(institutionId, sector);
  }

  public async createDepartment(
    institutionId: string,
    dept: {
      code: string;
      name_ar: string;
      name_en: string;
      default_sla_hours: number;
      head_user_id?: string | null;
    }
  ): Promise<StoredDepartment> {
    return storageAdapter.createDepartment({
      institution_id: institutionId,
      code: dept.code.toUpperCase().trim(),
      name_ar: dept.name_ar.trim(),
      name_en: dept.name_en.trim(),
      default_sla_hours: Math.max(1, dept.default_sla_hours || 48),
      head_user_id: dept.head_user_id || null,
      is_active: true,
    });
  }

  public async updateDepartment(
    deptId: string,
    updates: Partial<StoredDepartment>
  ): Promise<StoredDepartment | null> {
    return storageAdapter.updateDepartment(deptId, updates);
  }

  public async deleteDepartment(deptId: string): Promise<boolean> {
    return storageAdapter.deleteDepartment(deptId);
  }

  public async getStaff(institutionId: string): Promise<InstitutionStaffMember[]> {
    return storageAdapter.getStaffMembers(institutionId);
  }

  public async createStaffMember(
    institutionId: string,
    staff: {
      name: string;
      email: string;
      phone?: string | null;
      role: InstitutionStaffRole;
      department_id?: string | null;
    }
  ): Promise<InstitutionStaffMember> {
    return storageAdapter.createStaffMember({
      institution_id: institutionId,
      name: staff.name.trim(),
      email: staff.email.trim().toLowerCase(),
      phone: staff.phone || null,
      role: staff.role,
      department_id: staff.department_id || null,
      is_active: true,
    });
  }

  public async updateStaffMember(
    staffId: string,
    updates: Partial<InstitutionStaffMember>
  ): Promise<InstitutionStaffMember | null> {
    return storageAdapter.updateStaffMember(staffId, updates);
  }

  public async deleteStaffMember(staffId: string): Promise<boolean> {
    return storageAdapter.deleteStaffMember(staffId);
  }

  public getSectorCategories(sector: SectorType) {
    const config = getSectorConfig(sector);
    const categories = getSectorTaxonomy(sector);
    return {
      sector,
      nameAr: config.title_ar,
      beneficiaryTerm: {
        term_ar: config.beneficiaryTerm.ar,
        term_en: config.beneficiaryTerm.en,
      },
      categories,
      defaultDepartments: config.defaultDepartments,
    };
  }
}

export const tenantAdminService = new TenantAdminService();
