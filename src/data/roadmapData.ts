// GENERATED from Tabet_Flowchart_Data_Framework.xlsx — do not hand-edit, rerun the ETL script instead.
import type { RoadmapData } from './types'

export const roadmapData: RoadmapData = {
  "nodes": [
    {
      "key": "A",
      "id": "sales_customer_opportunities",
      "label": "Sales & Customer Opportunities",
      "lane": "Sales & Quoting",
      "flowStage": 1,
      "role": "Input",
      "status": "Current State",
      "parentGroup": "Commercial",
      "detailTitle": "Sales & Customer Opportunities",
      "inputsSummary": "Customer demand, RFQs, forecasts, repeat orders, market opportunities",
      "outputsSummary": "Qualified opportunity or RFQ package ready for estimating",
      "process": {
        "owner": "PLACEHOLDER - process owner",
        "inputs": "Customer demand, RFQs, forecasts, repeat orders, market opportunities",
        "majorActivities": "Capture opportunity, qualify fit, identify customer requirements, assign follow-up",
        "outputs": "Qualified opportunity or RFQ package ready for estimating",
        "qualityCheckpoints": "Customer requirement clarity; due-date and drawing/package completeness",
        "painPoints": "PLACEHOLDER - manual work, delays, duplicate entry, quality risk",
        "opportunity": "PLACEHOLDER - improvement idea",
        "timeSavings": "PLACEHOLDER - annual hours or time-savings estimate",
        "notes": "Validate with the process owner before using in production."
      },
      "software": [
        {
          "category": "ERP/MRP System",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Department Software",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Spreadsheet/Tracker",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "AI/Automation",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Future/PPS Integration",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Future / Planned",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        }
      ]
    },
    {
      "key": "B",
      "id": "estimating_quoting",
      "label": "Estimating & Quoting",
      "lane": "Sales & Quoting",
      "flowStage": 2,
      "role": "Process",
      "status": "Current State",
      "parentGroup": "Commercial",
      "detailTitle": "Estimating & Quoting",
      "inputsSummary": "RFQ package, drawings, specifications, historical pricing, material assumptions",
      "outputsSummary": "Customer quote, assumptions, lead time, exclusions, follow-up tasks",
      "process": {
        "owner": "PLACEHOLDER - process owner",
        "inputs": "RFQ package, drawings, specifications, historical pricing, material assumptions",
        "majorActivities": "Estimate labor/material, assess manufacturability, price work, review quote approval needs",
        "outputs": "Customer quote, assumptions, lead time, exclusions, follow-up tasks",
        "qualityCheckpoints": "Quote review, risk review, pricing approval, manufacturability concerns logged",
        "painPoints": "PLACEHOLDER - manual work, delays, duplicate entry, quality risk",
        "opportunity": "PLACEHOLDER - improvement idea",
        "timeSavings": "PLACEHOLDER - annual hours or time-savings estimate",
        "notes": "Validate with the process owner before using in production."
      },
      "software": [
        {
          "category": "ERP/MRP System",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Department Software",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Spreadsheet/Tracker",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "AI/Automation",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Future/PPS Integration",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Future / Planned",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        }
      ]
    },
    {
      "key": "C",
      "id": "order_review_processing",
      "label": "Order Review & Processing",
      "lane": "Order Processing",
      "flowStage": 3,
      "role": "Process",
      "status": "Current State",
      "parentGroup": "Order Intake",
      "detailTitle": "Order Review & Processing",
      "inputsSummary": "Customer purchase order, accepted quote, drawings, specifications, delivery requirements",
      "outputsSummary": "Accepted order, order record, due dates, contract requirements, kickoff package",
      "process": {
        "owner": "PLACEHOLDER - process owner",
        "inputs": "Customer purchase order, accepted quote, drawings, specifications, delivery requirements",
        "majorActivities": "Review PO, confirm scope, enter order, acknowledge terms, start change-control record",
        "outputs": "Accepted order, order record, due dates, contract requirements, kickoff package",
        "qualityCheckpoints": "Contract review, PO-to-quote match, flow-down requirements, due-date feasibility",
        "painPoints": "PLACEHOLDER - manual work, delays, duplicate entry, quality risk",
        "opportunity": "PLACEHOLDER - improvement idea",
        "timeSavings": "PLACEHOLDER - annual hours or time-savings estimate",
        "notes": "Validate with the process owner before using in production."
      },
      "software": [
        {
          "category": "ERP/MRP System",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Department Software",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Spreadsheet/Tracker",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "AI/Automation",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Future/PPS Integration",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Future / Planned",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        }
      ]
    },
    {
      "key": "D",
      "id": "engineering_production_planning",
      "label": "Engineering & Production Planning",
      "lane": "Engineering & Planning",
      "flowStage": 4,
      "role": "Process",
      "status": "Current State",
      "parentGroup": "Pre-Production",
      "detailTitle": "Engineering & Production Planning",
      "inputsSummary": "Order package, drawings, specifications, BOM requirements, customer notes",
      "outputsSummary": "Production-ready job package, routings, BOMs, work instructions, programming requests",
      "process": {
        "owner": "PLACEHOLDER - process owner",
        "inputs": "Order package, drawings, specifications, BOM requirements, customer notes",
        "majorActivities": "Review drawings, create/revise BOMs and routings, prepare programming, release work instructions",
        "outputs": "Production-ready job package, routings, BOMs, work instructions, programming requests",
        "qualityCheckpoints": "Engineering review, revision control, producibility questions, release approval",
        "painPoints": "PLACEHOLDER - manual work, delays, duplicate entry, quality risk",
        "opportunity": "PLACEHOLDER - improvement idea",
        "timeSavings": "PLACEHOLDER - annual hours or time-savings estimate",
        "notes": "Validate with the process owner before using in production."
      },
      "software": [
        {
          "category": "ERP/MRP System",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Department Software",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Spreadsheet/Tracker",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "AI/Automation",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Future/PPS Integration",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Future / Planned",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        }
      ]
    },
    {
      "key": "E",
      "id": "purchasing_supplier_management",
      "label": "Purchasing & Supplier Management",
      "lane": "Supply Chain",
      "flowStage": 5,
      "role": "Process",
      "status": "Current State",
      "parentGroup": "Supply Chain",
      "detailTitle": "Purchasing & Supplier Management",
      "inputsSummary": "BOM, material requirements, supplier requirements, due dates, certifications needed",
      "outputsSummary": "Purchase orders, supplier confirmations, material ETA, outside-process plan",
      "process": {
        "owner": "PLACEHOLDER - process owner",
        "inputs": "BOM, material requirements, supplier requirements, due dates, certifications needed",
        "majorActivities": "Source material/services, issue purchase orders, expedite, manage supplier commitments",
        "outputs": "Purchase orders, supplier confirmations, material ETA, outside-process plan",
        "qualityCheckpoints": "Approved supplier, certification requirements, due-date and specification alignment",
        "painPoints": "PLACEHOLDER - manual work, delays, duplicate entry, quality risk",
        "opportunity": "PLACEHOLDER - improvement idea",
        "timeSavings": "PLACEHOLDER - annual hours or time-savings estimate",
        "notes": "Validate with the process owner before using in production."
      },
      "software": [
        {
          "category": "ERP/MRP System",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Department Software",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Spreadsheet/Tracker",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "AI/Automation",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Future/PPS Integration",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Future / Planned",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        }
      ]
    },
    {
      "key": "F",
      "id": "receiving_material_control",
      "label": "Receiving & Material Control",
      "lane": "Supply Chain",
      "flowStage": 6,
      "role": "Process",
      "status": "Current State",
      "parentGroup": "Supply Chain",
      "detailTitle": "Receiving & Material Control",
      "inputsSummary": "Incoming material, packing slips, purchase orders, certificates, outside-process returns",
      "outputsSummary": "Available material, receiving records, cert package, inventory transaction, discrepancies",
      "process": {
        "owner": "PLACEHOLDER - process owner",
        "inputs": "Incoming material, packing slips, purchase orders, certificates, outside-process returns",
        "majorActivities": "Receive, identify, inspect as required, record certs, move to inventory or job location",
        "outputs": "Available material, receiving records, cert package, inventory transaction, discrepancies",
        "qualityCheckpoints": "Receiving inspection, cert verification, material traceability, nonconformance trigger",
        "painPoints": "PLACEHOLDER - manual work, delays, duplicate entry, quality risk",
        "opportunity": "PLACEHOLDER - improvement idea",
        "timeSavings": "PLACEHOLDER - annual hours or time-savings estimate",
        "notes": "Validate with the process owner before using in production."
      },
      "software": [
        {
          "category": "ERP/MRP System",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Department Software",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Spreadsheet/Tracker",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "AI/Automation",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Future/PPS Integration",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Future / Planned",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        }
      ]
    },
    {
      "key": "G",
      "id": "project_management",
      "label": "Project Management",
      "lane": "Project Management",
      "flowStage": 7,
      "role": "Control",
      "status": "Current State",
      "parentGroup": "Execution Control",
      "detailTitle": "Project Management",
      "inputsSummary": "Released job, schedule, material status, customer commitments, risk/issues list",
      "outputsSummary": "Released/controlled shop work, schedule updates, status reporting, issue resolution",
      "process": {
        "owner": "PLACEHOLDER - process owner",
        "inputs": "Released job, schedule, material status, customer commitments, risk/issues list",
        "majorActivities": "Coordinate priorities, track milestones, manage blockers, communicate status, escalate risk",
        "outputs": "Released/controlled shop work, schedule updates, status reporting, issue resolution",
        "qualityCheckpoints": "Milestone review, customer due-date risk, resource conflicts, material readiness",
        "painPoints": "PLACEHOLDER - manual work, delays, duplicate entry, quality risk",
        "opportunity": "PLACEHOLDER - improvement idea",
        "timeSavings": "PLACEHOLDER - annual hours or time-savings estimate",
        "notes": "Validate with the process owner before using in production."
      },
      "software": [
        {
          "category": "ERP/MRP System",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Department Software",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Spreadsheet/Tracker",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "AI/Automation",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Future/PPS Integration",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Future / Planned",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        }
      ]
    },
    {
      "key": "H",
      "id": "laser_waterjet",
      "label": "Laser & Waterjet",
      "lane": "Manufacturing",
      "flowStage": 8,
      "role": "Work Center",
      "status": "Current State",
      "parentGroup": "Fabrication",
      "detailTitle": "Laser & Waterjet",
      "inputsSummary": "Released cut files, material, nesting plan, job traveler, inspection criteria",
      "outputsSummary": "Cut parts, remnants/scrap data, completion status, first-piece/in-process records",
      "process": {
        "owner": "PLACEHOLDER - process owner",
        "inputs": "Released cut files, material, nesting plan, job traveler, inspection criteria",
        "majorActivities": "Program/nest, stage material, cut parts, record completion and material usage",
        "outputs": "Cut parts, remnants/scrap data, completion status, first-piece/in-process records",
        "qualityCheckpoints": "Material match, nest verification, first-piece dimensional check, traceability",
        "painPoints": "PLACEHOLDER - manual work, delays, duplicate entry, quality risk",
        "opportunity": "PLACEHOLDER - improvement idea",
        "timeSavings": "PLACEHOLDER - annual hours or time-savings estimate",
        "notes": "Validate with the process owner before using in production."
      },
      "software": [
        {
          "category": "ERP/MRP System",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Department Software",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Spreadsheet/Tracker",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "AI/Automation",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Future/PPS Integration",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Future / Planned",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        }
      ]
    },
    {
      "key": "I",
      "id": "bending",
      "label": "Bending",
      "lane": "Manufacturing",
      "flowStage": 8,
      "role": "Work Center",
      "status": "Current State",
      "parentGroup": "Fabrication",
      "detailTitle": "Bending",
      "inputsSummary": "Cut parts, bend programs, tooling requirements, drawings, setup instructions",
      "outputsSummary": "Formed parts, production status, setup notes, dimensional checks",
      "process": {
        "owner": "PLACEHOLDER - process owner",
        "inputs": "Cut parts, bend programs, tooling requirements, drawings, setup instructions",
        "majorActivities": "Select tooling, set up brake, form parts, verify critical dimensions",
        "outputs": "Formed parts, production status, setup notes, dimensional checks",
        "qualityCheckpoints": "Tooling/setup verification, first-piece inspection, bend angle and feature checks",
        "painPoints": "PLACEHOLDER - manual work, delays, duplicate entry, quality risk",
        "opportunity": "PLACEHOLDER - improvement idea",
        "timeSavings": "PLACEHOLDER - annual hours or time-savings estimate",
        "notes": "Validate with the process owner before using in production."
      },
      "software": [
        {
          "category": "ERP/MRP System",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Department Software",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Spreadsheet/Tracker",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "AI/Automation",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Future/PPS Integration",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Future / Planned",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        }
      ]
    },
    {
      "key": "J",
      "id": "machining",
      "label": "Machining",
      "lane": "Manufacturing",
      "flowStage": 8,
      "role": "Work Center",
      "status": "Current State",
      "parentGroup": "Fabrication",
      "detailTitle": "Machining",
      "inputsSummary": "Material/parts, CNC programs, tooling, drawings, inspection requirements",
      "outputsSummary": "Machined parts, inspection records, setup/cycle notes, work-center status",
      "process": {
        "owner": "PLACEHOLDER - process owner",
        "inputs": "Material/parts, CNC programs, tooling, drawings, inspection requirements",
        "majorActivities": "Program/setup machine, machine features, inspect critical dimensions, record completion",
        "outputs": "Machined parts, inspection records, setup/cycle notes, work-center status",
        "qualityCheckpoints": "Program verification, tooling verification, first-piece/in-process inspection",
        "painPoints": "PLACEHOLDER - manual work, delays, duplicate entry, quality risk",
        "opportunity": "PLACEHOLDER - improvement idea",
        "timeSavings": "PLACEHOLDER - annual hours or time-savings estimate",
        "notes": "Validate with the process owner before using in production."
      },
      "software": [
        {
          "category": "ERP/MRP System",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Department Software",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Spreadsheet/Tracker",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "AI/Automation",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Future/PPS Integration",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Future / Planned",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        }
      ]
    },
    {
      "key": "K",
      "id": "welding",
      "label": "Welding",
      "lane": "Manufacturing",
      "flowStage": 8,
      "role": "Work Center",
      "status": "Current State",
      "parentGroup": "Fabrication",
      "detailTitle": "Welding",
      "inputsSummary": "Cut/formed/machined parts, weld procedures, fixtures, qualifications, drawings",
      "outputsSummary": "Welded assemblies, weld records, inspection status, rework/nonconformance triggers",
      "process": {
        "owner": "PLACEHOLDER - process owner",
        "inputs": "Cut/formed/machined parts, weld procedures, fixtures, qualifications, drawings",
        "majorActivities": "Fit-up, tack, weld, inspect welds, document required qualification records",
        "outputs": "Welded assemblies, weld records, inspection status, rework/nonconformance triggers",
        "qualityCheckpoints": "Fit-up inspection, WPS/PQR/WPQ requirements, visual weld inspection, dimensional checks",
        "painPoints": "PLACEHOLDER - manual work, delays, duplicate entry, quality risk",
        "opportunity": "PLACEHOLDER - improvement idea",
        "timeSavings": "PLACEHOLDER - annual hours or time-savings estimate",
        "notes": "Validate with the process owner before using in production."
      },
      "software": [
        {
          "category": "ERP/MRP System",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Department Software",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Spreadsheet/Tracker",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "AI/Automation",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Future/PPS Integration",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Future / Planned",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        }
      ]
    },
    {
      "key": "L",
      "id": "grinding_finishing",
      "label": "Grinding & Finishing",
      "lane": "Finishing & Special Processes",
      "flowStage": 9,
      "role": "Convergence",
      "status": "Current State",
      "parentGroup": "Finishing",
      "detailTitle": "Grinding & Finishing",
      "inputsSummary": "Fabricated parts/assemblies, finish requirements, rework notes, inspection requirements",
      "outputsSummary": "Finished parts ready for coating/marking/assembly, finish status, rework notes",
      "process": {
        "owner": "PLACEHOLDER - process owner",
        "inputs": "Fabricated parts/assemblies, finish requirements, rework notes, inspection requirements",
        "majorActivities": "Deburr, grind, blend, surface prep, confirm cosmetic/functional finish needs",
        "outputs": "Finished parts ready for coating/marking/assembly, finish status, rework notes",
        "qualityCheckpoints": "Surface finish check, burr/sharp-edge check, dimensional impact review",
        "painPoints": "PLACEHOLDER - manual work, delays, duplicate entry, quality risk",
        "opportunity": "PLACEHOLDER - improvement idea",
        "timeSavings": "PLACEHOLDER - annual hours or time-savings estimate",
        "notes": "Validate with the process owner before using in production."
      },
      "software": [
        {
          "category": "ERP/MRP System",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Department Software",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Spreadsheet/Tracker",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "AI/Automation",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Future/PPS Integration",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Future / Planned",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        }
      ]
    },
    {
      "key": "M",
      "id": "coatings",
      "label": "Coatings",
      "lane": "Finishing & Special Processes",
      "flowStage": 10,
      "role": "Process",
      "status": "Current State",
      "parentGroup": "Finishing",
      "detailTitle": "Coatings",
      "inputsSummary": "Finished parts, coating specifications, color/finish requirements, supplier/internal route",
      "outputsSummary": "Coated parts, coating records/certs, status update, discrepancy record if needed",
      "process": {
        "owner": "PLACEHOLDER - process owner",
        "inputs": "Finished parts, coating specifications, color/finish requirements, supplier/internal route",
        "majorActivities": "Prepare coating order, track outside/internal coating, verify certs and finish requirements",
        "outputs": "Coated parts, coating records/certs, status update, discrepancy record if needed",
        "qualityCheckpoints": "Specification verification, cert review, coating quality inspection",
        "painPoints": "PLACEHOLDER - manual work, delays, duplicate entry, quality risk",
        "opportunity": "PLACEHOLDER - improvement idea",
        "timeSavings": "PLACEHOLDER - annual hours or time-savings estimate",
        "notes": "Validate with the process owner before using in production."
      },
      "software": [
        {
          "category": "ERP/MRP System",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Department Software",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Spreadsheet/Tracker",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "AI/Automation",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Future/PPS Integration",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Future / Planned",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        }
      ]
    },
    {
      "key": "N",
      "id": "marking",
      "label": "Marking",
      "lane": "Finishing & Special Processes",
      "flowStage": 11,
      "role": "Process",
      "status": "Current State",
      "parentGroup": "Finishing",
      "detailTitle": "Marking",
      "inputsSummary": "Coated/finished parts, marking requirements, artwork, labels, serialization data",
      "outputsSummary": "Marked parts, marking records, serialization/trace data, inspection status",
      "process": {
        "owner": "PLACEHOLDER - process owner",
        "inputs": "Coated/finished parts, marking requirements, artwork, labels, serialization data",
        "majorActivities": "Apply labels, engraving, silk screen, laser marking, verify placement and content",
        "outputs": "Marked parts, marking records, serialization/trace data, inspection status",
        "qualityCheckpoints": "MIL-STD-130 or customer requirement check, placement/content verification",
        "painPoints": "PLACEHOLDER - manual work, delays, duplicate entry, quality risk",
        "opportunity": "PLACEHOLDER - improvement idea",
        "timeSavings": "PLACEHOLDER - annual hours or time-savings estimate",
        "notes": "Validate with the process owner before using in production."
      },
      "software": [
        {
          "category": "ERP/MRP System",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Department Software",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Spreadsheet/Tracker",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "AI/Automation",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Future/PPS Integration",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Future / Planned",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        }
      ]
    },
    {
      "key": "O",
      "id": "assembly",
      "label": "Assembly",
      "lane": "Assembly & Test",
      "flowStage": 12,
      "role": "Process",
      "status": "Current State",
      "parentGroup": "Assembly",
      "detailTitle": "Assembly",
      "inputsSummary": "Kitted parts, work instructions, hardware, wiring, tools, drawings, shortages list",
      "outputsSummary": "Completed assembly, build records, shortage/rework notes, test-ready unit",
      "process": {
        "owner": "PLACEHOLDER - process owner",
        "inputs": "Kitted parts, work instructions, hardware, wiring, tools, drawings, shortages list",
        "majorActivities": "Assemble components, record progress, resolve shortages, perform build checks",
        "outputs": "Completed assembly, build records, shortage/rework notes, test-ready unit",
        "qualityCheckpoints": "Assembly verification, torque/fit checks, traveler signoff, shortage closure",
        "painPoints": "PLACEHOLDER - manual work, delays, duplicate entry, quality risk",
        "opportunity": "PLACEHOLDER - improvement idea",
        "timeSavings": "PLACEHOLDER - annual hours or time-savings estimate",
        "notes": "Validate with the process owner before using in production."
      },
      "software": [
        {
          "category": "ERP/MRP System",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Department Software",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Spreadsheet/Tracker",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "AI/Automation",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Future/PPS Integration",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Future / Planned",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        }
      ]
    },
    {
      "key": "P",
      "id": "testing",
      "label": "Testing",
      "lane": "Assembly & Test",
      "flowStage": 13,
      "role": "Quality Gate",
      "status": "Current State",
      "parentGroup": "Assembly",
      "detailTitle": "Testing",
      "inputsSummary": "Completed assembly, test procedure, equipment, acceptance criteria, customer requirements",
      "outputsSummary": "Test results, accepted/rejected status, rework actions, final inspection package",
      "process": {
        "owner": "PLACEHOLDER - process owner",
        "inputs": "Completed assembly, test procedure, equipment, acceptance criteria, customer requirements",
        "majorActivities": "Run required tests, collect results, document failures, route rework if needed",
        "outputs": "Test results, accepted/rejected status, rework actions, final inspection package",
        "qualityCheckpoints": "Procedure adherence, equipment calibration, data completeness, acceptance criteria",
        "painPoints": "PLACEHOLDER - manual work, delays, duplicate entry, quality risk",
        "opportunity": "PLACEHOLDER - improvement idea",
        "timeSavings": "PLACEHOLDER - annual hours or time-savings estimate",
        "notes": "Validate with the process owner before using in production."
      },
      "software": [
        {
          "category": "ERP/MRP System",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Department Software",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Spreadsheet/Tracker",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "AI/Automation",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Future/PPS Integration",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Future / Planned",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        }
      ]
    },
    {
      "key": "Q",
      "id": "final_quality_assurance",
      "label": "Final Quality Assurance",
      "lane": "Quality Assurance",
      "flowStage": 14,
      "role": "Quality Gate",
      "status": "Current State",
      "parentGroup": "Quality",
      "detailTitle": "Final Quality Assurance",
      "inputsSummary": "Completed/tested item, traveler, cert package, inspection plan, customer requirements",
      "outputsSummary": "Accepted product, final documentation package, shipping release or rework instruction",
      "process": {
        "owner": "PLACEHOLDER - process owner",
        "inputs": "Completed/tested item, traveler, cert package, inspection plan, customer requirements",
        "majorActivities": "Final inspection, documentation review, nonconformance handling, release approval",
        "outputs": "Accepted product, final documentation package, shipping release or rework instruction",
        "qualityCheckpoints": "Final inspection, documentation completeness, cert traceability, release authorization",
        "painPoints": "PLACEHOLDER - manual work, delays, duplicate entry, quality risk",
        "opportunity": "PLACEHOLDER - improvement idea",
        "timeSavings": "PLACEHOLDER - annual hours or time-savings estimate",
        "notes": "Validate with the process owner before using in production."
      },
      "software": [
        {
          "category": "ERP/MRP System",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Department Software",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Spreadsheet/Tracker",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "AI/Automation",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Future/PPS Integration",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Future / Planned",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        }
      ]
    },
    {
      "key": "R",
      "id": "shipping_customer_delivery",
      "label": "Shipping & Customer Delivery",
      "lane": "Shipping",
      "flowStage": 15,
      "role": "Output",
      "status": "Current State",
      "parentGroup": "Fulfillment",
      "detailTitle": "Shipping & Customer Delivery",
      "inputsSummary": "Released product, packing requirements, shipment documents, customer delivery requirements",
      "outputsSummary": "Customer shipment, tracking information, delivery records, invoice trigger",
      "process": {
        "owner": "PLACEHOLDER - process owner",
        "inputs": "Released product, packing requirements, shipment documents, customer delivery requirements",
        "majorActivities": "Pack, label, prepare documents, ship, notify customer, close delivery tasks",
        "outputs": "Customer shipment, tracking information, delivery records, invoice trigger",
        "qualityCheckpoints": "Shipping release, packaging verification, document packet check, carrier/tracking validation",
        "painPoints": "PLACEHOLDER - manual work, delays, duplicate entry, quality risk",
        "opportunity": "PLACEHOLDER - improvement idea",
        "timeSavings": "PLACEHOLDER - annual hours or time-savings estimate",
        "notes": "Validate with the process owner before using in production."
      },
      "software": [
        {
          "category": "ERP/MRP System",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Department Software",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Spreadsheet/Tracker",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "AI/Automation",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Current / Placeholder",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        },
        {
          "category": "Future/PPS Integration",
          "packageName": "PLACEHOLDER - enter software package",
          "currentOrFuture": "Future / Planned",
          "owner": "PLACEHOLDER - owner",
          "integrationDirection": "PLACEHOLDER - integration direction",
          "keyDataObjects": "PLACEHOLDER - key records/data objects"
        }
      ]
    }
  ],
  "edges": [
    {
      "id": "e_sales_customer_opportunities_to_estimating_quoting",
      "source": "sales_customer_opportunities",
      "target": "estimating_quoting",
      "animated": false,
      "handoffType": "Information + status",
      "dataMaterialHandoff": "Sales & Customer Opportunities to Estimating & Quoting",
      "notes": "Confirm exact handoff details with process owner."
    },
    {
      "id": "e_estimating_quoting_to_order_review_processing",
      "source": "estimating_quoting",
      "target": "order_review_processing",
      "animated": false,
      "handoffType": "Information + status",
      "dataMaterialHandoff": "Estimating & Quoting to Order Review & Processing",
      "notes": "Confirm exact handoff details with process owner."
    },
    {
      "id": "e_order_review_processing_to_engineering_production_planning",
      "source": "order_review_processing",
      "target": "engineering_production_planning",
      "animated": false,
      "handoffType": "Information + status",
      "dataMaterialHandoff": "Order Review & Processing to Engineering & Production Planning",
      "notes": "Confirm exact handoff details with process owner."
    },
    {
      "id": "e_engineering_production_planning_to_purchasing_supplier_management",
      "source": "engineering_production_planning",
      "target": "purchasing_supplier_management",
      "animated": false,
      "handoffType": "Information + status",
      "dataMaterialHandoff": "Engineering & Production Planning to Purchasing & Supplier Management",
      "notes": "Confirm exact handoff details with process owner."
    },
    {
      "id": "e_purchasing_supplier_management_to_receiving_material_control",
      "source": "purchasing_supplier_management",
      "target": "receiving_material_control",
      "animated": false,
      "handoffType": "Information + status",
      "dataMaterialHandoff": "Purchasing & Supplier Management to Receiving & Material Control",
      "notes": "Confirm exact handoff details with process owner."
    },
    {
      "id": "e_receiving_material_control_to_project_management",
      "source": "receiving_material_control",
      "target": "project_management",
      "animated": false,
      "handoffType": "Information + status",
      "dataMaterialHandoff": "Receiving & Material Control to Project Management",
      "notes": "Confirm exact handoff details with process owner."
    },
    {
      "id": "e_project_management_to_laser_waterjet",
      "source": "project_management",
      "target": "laser_waterjet",
      "label": "Release to laser/waterjet",
      "animated": false,
      "handoffType": "Material + status",
      "dataMaterialHandoff": "Project Management to Laser & Waterjet",
      "notes": "Confirm exact handoff details with process owner."
    },
    {
      "id": "e_project_management_to_bending",
      "source": "project_management",
      "target": "bending",
      "label": "Release to bending",
      "animated": false,
      "handoffType": "Material + status",
      "dataMaterialHandoff": "Project Management to Bending",
      "notes": "Confirm exact handoff details with process owner."
    },
    {
      "id": "e_project_management_to_machining",
      "source": "project_management",
      "target": "machining",
      "label": "Release to machining",
      "animated": false,
      "handoffType": "Material + status",
      "dataMaterialHandoff": "Project Management to Machining",
      "notes": "Confirm exact handoff details with process owner."
    },
    {
      "id": "e_project_management_to_welding",
      "source": "project_management",
      "target": "welding",
      "label": "Release to welding",
      "animated": false,
      "handoffType": "Material + status",
      "dataMaterialHandoff": "Project Management to Welding",
      "notes": "Confirm exact handoff details with process owner."
    },
    {
      "id": "e_laser_waterjet_to_grinding_finishing",
      "source": "laser_waterjet",
      "target": "grinding_finishing",
      "animated": false,
      "handoffType": "Material + status",
      "dataMaterialHandoff": "Laser & Waterjet to Grinding & Finishing",
      "notes": "Confirm exact handoff details with process owner."
    },
    {
      "id": "e_bending_to_grinding_finishing",
      "source": "bending",
      "target": "grinding_finishing",
      "animated": false,
      "handoffType": "Material + status",
      "dataMaterialHandoff": "Bending to Grinding & Finishing",
      "notes": "Confirm exact handoff details with process owner."
    },
    {
      "id": "e_machining_to_grinding_finishing",
      "source": "machining",
      "target": "grinding_finishing",
      "animated": false,
      "handoffType": "Material + status",
      "dataMaterialHandoff": "Machining to Grinding & Finishing",
      "notes": "Confirm exact handoff details with process owner."
    },
    {
      "id": "e_welding_to_grinding_finishing",
      "source": "welding",
      "target": "grinding_finishing",
      "animated": false,
      "handoffType": "Material + status",
      "dataMaterialHandoff": "Welding to Grinding & Finishing",
      "notes": "Confirm exact handoff details with process owner."
    },
    {
      "id": "e_grinding_finishing_to_coatings",
      "source": "grinding_finishing",
      "target": "coatings",
      "animated": false,
      "handoffType": "Information + status",
      "dataMaterialHandoff": "Grinding & Finishing to Coatings",
      "notes": "Confirm exact handoff details with process owner."
    },
    {
      "id": "e_coatings_to_marking",
      "source": "coatings",
      "target": "marking",
      "animated": false,
      "handoffType": "Information + status",
      "dataMaterialHandoff": "Coatings to Marking",
      "notes": "Confirm exact handoff details with process owner."
    },
    {
      "id": "e_marking_to_assembly",
      "source": "marking",
      "target": "assembly",
      "animated": false,
      "handoffType": "Information + status",
      "dataMaterialHandoff": "Marking to Assembly",
      "notes": "Confirm exact handoff details with process owner."
    },
    {
      "id": "e_assembly_to_testing",
      "source": "assembly",
      "target": "testing",
      "animated": false,
      "handoffType": "Information + status",
      "dataMaterialHandoff": "Assembly to Testing",
      "notes": "Confirm exact handoff details with process owner."
    },
    {
      "id": "e_testing_to_final_quality_assurance",
      "source": "testing",
      "target": "final_quality_assurance",
      "animated": false,
      "handoffType": "Information + status",
      "dataMaterialHandoff": "Testing to Final Quality Assurance",
      "notes": "Confirm exact handoff details with process owner."
    },
    {
      "id": "e_final_quality_assurance_to_shipping_customer_delivery",
      "source": "final_quality_assurance",
      "target": "shipping_customer_delivery",
      "animated": false,
      "handoffType": "Information + status",
      "dataMaterialHandoff": "Final Quality Assurance to Shipping & Customer Delivery",
      "notes": "Confirm exact handoff details with process owner."
    }
  ],
  "lanes": [
    "Sales & Quoting",
    "Order Processing",
    "Engineering & Planning",
    "Supply Chain",
    "Project Management",
    "Manufacturing",
    "Finishing & Special Processes",
    "Assembly & Test",
    "Quality Assurance",
    "Shipping"
  ]
}
