declare module 'jspdf-autotable' {
  import 'jspdf'
  interface jsPDF {
    autoTable: (options: any) => void
  }
}
