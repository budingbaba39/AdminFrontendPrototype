import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { DatePicker } from "./ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Checkbox } from "./ui/checkbox";
import { FileText, AlertTriangle } from "lucide-react";

// ✅ Transaction type
type Transaction = {
  id: number;
  description: string;
  in: number;
  out: number;
  time: string;
  match: string;
  fee: number;
  remarks: string;
  info: string;
};

// ✅ Sample bank accounts
const sampleBanks = [
  { id: "PBB", label: "PBB (TAN HOCK LEONG)" },
  { id: "MBB1", label: "MBB (SHELIN FOOD SDN BHD)" },
  { id: "HLB", label: "HLB (TestDemo666)" },
  { id: "WCPMY", label: "WCPMY (test bank display = 0)" },
  { id: "CITIUS", label: "CITIUS (Test Account)" },
];

// AUTO PAY bank accounts
const autoPayBanks = [
  { id: "RHBQR_AUTOPAY", label: "RHBQR (AUTOPAY)" },
  { id: "MBB_TESTBANKMBB", label: "MBB (TestBankMBB)" },
];

// Dummy data for banks
const bankData: Record<
  string,
  {
    start: number;
    today: number;
    balance: number;
    transactions: Transaction[];
  }
> = {
  PBB: {
    start: 2000,
    today: 300,
    balance: 2300,
    transactions: [
      {
        id: 1,
        description: "Salary Credit",
        in: 300,
        out: 0,
        time: "12:00:00",
        match: "Yes",
        fee: 0,
        remarks: "Monthly salary",
        info: "System",
      },
    ],
  },
  MBB1: {
    start: 5000,
    today: -200,
    balance: 4800,
    transactions: [
      {
        id: 2,
        description: "ATM Withdrawal",
        in: 0,
        out: 200,
        time: "14:30:00",
        match: "Yes",
        fee: 0,
        remarks: "Cash withdrawal",
        info: "System",
      },
    ],
  },
  HLB: {
    start: 1000,
    today: 0,
    balance: 1000,
    transactions: [
      {
        id: 5,
        description: "Test Transaction",
        in: 0,
        out: 0,
        time: "15:00:00",
        match: "No",
        fee: 0,
        remarks: "Test remarks",
        info: "System",
      },
    ],
  },
  WCPMY: { start: 0, today: 0, balance: 0, transactions: [] },
  CITIUS: {
    start: 200,
    today: 50,
    balance: 250,
    transactions: [
      {
        id: 3,
        description: "Online Transfer",
        in: 50,
        out: 0,
        time: "09:00:00",
        match: "Yes",
        fee: 0,
        remarks: "From client",
        info: "System",
      },
    ],
  },
  RHBQR_AUTOPAY: {
    start: 1000,
    today: 200,
    balance: 1200,
    transactions: [
      {
        id: 1,
        description: "Deposit from client",
        in: 200,
        out: 0,
        time: "09:00:00",
        match: "Yes",
        fee: 0,
        remarks: "Cash deposit",
        info: "System",
      },
    ],
  },
  MBB_TESTBANKMBB: {
    start: 500,
    today: 100,
    balance: 600,
    transactions: [
      {
        id: 2,
        description: "QR Top-up",
        in: 100,
        out: 0,
        time: "11:00:00",
        match: "Yes",
        fee: 0,
        remarks: "Autopay Top-up",
        info: "System",
      },
    ],
  },
};

// Bank summary data for the modal
const bankSummaryData = [
  { bank: "MBB (bank sim)", start: 0.0, balance: 0.0 },
  { bank: "PBB (TAN HOCK LEONG)", start: 20.0, balance: 20.0 },
  { bank: "HLB (TestDemo666)", start: -65.0, balance: -65.0 },
  {
    bank: "MBB (SHELIN FOOD SDN BHD)",
    start: 2500.0,
    balance: 2500.0,
  },
  {
    bank: "WCPMY (test bank display = 0)",
    start: 0.0,
    balance: 0.0,
  },
  { bank: "CITIUS (Test Account)", start: 5.0, balance: 5.0 },
  { bank: "RHBQR (AUTOPAY)", start: 0.0, balance: 0.0 },
  { bank: "MBB (TestBankMBB)", start: 0.0, balance: 0.0 },
];

// Transaction type summary data
const transactionSummaryData = [
  { type: "Start", amount: 19613.0 },
  { type: "Deposit", amount: 90.0 },
  { type: "Withdraw", amount: 0.0 },
  { type: "Burn", amount: 0.0 },
  { type: "Free", amount: 0.0 },
  { type: "Manual", amount: 0.0 },
  { type: "Cash In", amount: 0.0 },
  { type: "Cash Out", amount: 0.0 },
  { type: "Cash Angpao", amount: 0.0 },
  { type: "Keep", amount: 0.0 },
  { type: "Claim", amount: 0.0 },
  { type: "Fee", amount: 0.0 },
];

export default function BankManagement() {
  const [selectedDate, setSelectedDate] = useState<
    Date | undefined
  >(new Date());
  const [selectedAllBank, setSelectedAllBank] =
    useState<string>("");
  const [selectedAutoPayBank, setSelectedAutoPayBank] =
    useState<string>("");
  const [isReportModalOpen, setIsReportModalOpen] =
    useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] =
    useState(false);
  const [excludePaymentGateway, setExcludePaymentGateway] =
    useState(false);
  const [rowLimit, setRowLimit] = useState("100");
  const [accountType, setAccountType] = useState("ALL");

  const currentBanks =
    accountType === "AUTO PAY" ? autoPayBanks : sampleBanks;
  const selectedBank =
    accountType === "AUTO PAY"
      ? selectedAutoPayBank
      : selectedAllBank;

  const transactions =
    (selectedBank && bankData[selectedBank]?.transactions) ||
    [];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Top Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 flex flex-wrap gap-3 items-center">
        {/* Date Picker */}
        <DatePicker
          value={selectedDate}
          onChange={setSelectedDate}
        />

        {/* Row Limit Selector */}
        <Select value={rowLimit} onValueChange={setRowLimit}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="100">100 rows</SelectItem>
            <SelectItem value="200">200 rows</SelectItem>
            <SelectItem value="300">300 rows</SelectItem>
            <SelectItem value="400">400 rows</SelectItem>
            <SelectItem value="500">500 rows</SelectItem>
            <SelectItem value="600">600 rows</SelectItem>
            <SelectItem value="700">700 rows</SelectItem>
            <SelectItem value="800">800 rows</SelectItem>
            <SelectItem value="900">900 rows</SelectItem>
            <SelectItem value="1000">1000 rows</SelectItem>
          </SelectContent>
        </Select>

        {/* Account Type Selector */}
        <Select
          value={accountType}
          onValueChange={setAccountType}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">ALL</SelectItem>
            <SelectItem value="AUTO PAY">AUTO PAY</SelectItem>
          </SelectContent>
        </Select>

        {/* Search Bar */}
        <Input
          placeholder="Search Description / ID"
          className="flex-1"
        />

        {/* Bank Selector */}
        <Select
          value={selectedBank || undefined}
          onValueChange={(value) => {
            if (accountType === "AUTO PAY") {
              setSelectedAutoPayBank(value);
            } else {
              setSelectedAllBank(value);
            }
          }}
        >
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select Bank Account" />
          </SelectTrigger>
          <SelectContent>
            {currentBanks.map((bank) => (
              <SelectItem key={bank.id} value={bank.id}>
                {bank.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Report Icon Button */}
        <Dialog
          open={isReportModalOpen}
          onOpenChange={setIsReportModalOpen}
        >
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
            >
              <FileText className="w-4 h-4 mr-2" />
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[1000px] max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                Bank Summary Report -{" "}
                {selectedDate
                  ? selectedDate.toLocaleDateString("en-CA")
                  : "2025-09-23"}
              </DialogTitle>
              <DialogDescription>
                View detailed bank summary report including
                balances and transaction types.
              </DialogDescription>
            </DialogHeader>

            {/* Exclude checkbox */}
            <div className="flex items-center space-x-2 my-2">
              <Checkbox
                id="exclude-gateway"
                checked={excludePaymentGateway}
                onCheckedChange={(checked) =>
                  setExcludePaymentGateway(checked as boolean)
                }
              />
              <label
                htmlFor="exclude-gateway"
                className="text-sm text-gray-600"
              >
                Exclude Payment Gateway
              </label>
            </div>

            {/* Bank Summary Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-blue-900 text-white">
                  <tr>
                    <th className="px-4 py-2 text-left">
                      Bank
                    </th>
                    <th className="px-4 py-2 text-right">
                      Start
                    </th>
                    <th className="px-4 py-2 text-right">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bankSummaryData.map((bank, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2">{bank.bank}</td>
                      <td className="px-4 py-2 text-right">
                        {bank.start.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {bank.balance.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {/* Totals */}
                  <tr className="bg-green-200 font-semibold">
                    <td className="px-4 py-2">
                      Total (Bank Only)
                    </td>
                    <td className="px-4 py-2 text-right">
                      19,613.00
                    </td>
                    <td className="px-4 py-2 text-right">
                      19,613.00
                    </td>
                  </tr>
                  {!excludePaymentGateway && (
                    <tr className="bg-green-300 font-semibold">
                      <td className="px-4 py-2">Total</td>
                      <td className="px-4 py-2 text-right">
                        19,613.00
                      </td>
                      <td className="px-4 py-2 text-right">
                        19,613.00
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Transaction Type Summary */}
            <div className="border rounded-lg overflow-hidden mt-6">
              <table className="w-full text-sm">
                <thead className="bg-blue-900 text-white">
                  <tr>
                    <th className="px-4 py-2 text-left">
                      Type
                    </th>
                    <th className="px-4 py-2 text-right">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactionSummaryData.map((t, i) => (
                    <tr
                      key={i}
                      className={
                        i % 2 === 0 ? "bg-gray-50" : ""
                      }
                    >
                      <td className="px-4 py-2">{t.type}</td>
                      <td className="px-4 py-2 text-right">
                        {t.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-green-300 font-semibold">
                    <td className="px-4 py-2">Total</td>
                    <td className="px-4 py-2 text-right">
                      19,613.00
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                onClick={() => setIsReportModalOpen(false)}
                className="bg-red-500 text-white"
              >
                CLOSE
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Alert Icon Button */}
        <Dialog
          open={isAlertModalOpen}
          onOpenChange={setIsAlertModalOpen}
        >
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
            >
              <AlertTriangle className="w-4 h-4 text-orange-500" />
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[1000px] max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-red-500">
                {selectedDate
                  ? selectedDate.toLocaleDateString("en-CA")
                  : "2025-09-24"}
              </DialogTitle>
              <DialogDescription>
                Alert notifications for the selected date.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-blue-900 text-white">
                    <tr>
                      <th className="px-4 py-3">Bank</th>
                      <th className="px-4 py-3">
                        Transaction ID
                      </th>
                      <th className="px-4 py-3">Problem</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No alerts for this date
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex justify-center pt-4">
                <Button
                  onClick={() => setIsAlertModalOpen(false)}
                  className="bg-red-500 text-white"
                >
                  CLOSE
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Balance Summary */}
      {accountType === "AUTO PAY" ? (
        selectedBank ? (
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="grid grid-cols-3 gap-4 text-sm font-semibold">
              <div className="bg-teal-500 text-white p-3 rounded text-center">
                <div className="flex justify-between">
                  <span>START</span>
                  <span>
                    {bankData[selectedBank]?.start.toFixed(2) ||
                      "0.00"}
                  </span>
                </div>
              </div>
              <div className="bg-teal-500 text-white p-3 rounded text-center">
                <div className="flex justify-between">
                  <span>TODAY</span>
                  <span>
                    {bankData[selectedBank]?.today.toFixed(2) ||
                      "0.00"}
                  </span>
                </div>
              </div>
              <div className="bg-teal-500 text-white p-3 rounded text-center">
                <div className="flex justify-between">
                  <span>BALANCE</span>
                  <span>
                    {bankData[selectedBank]?.balance.toFixed(
                      2,
                    ) || "0.00"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            Please select a bank account
          </div>
        )
      ) : selectedBank ? (
        <div className="bg-white rounded-lg shadow-sm border p-4 flex gap-6 text-sm font-semibold">
          <div className="flex gap-2">
            <span className="text-gray-600">START:</span>
            <span className="text-gray-900">
              {bankData[selectedBank]?.start.toFixed(2) ||
                "0.00"}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-600">TODAY:</span>
            <span className="text-gray-900">
              {bankData[selectedBank]?.today.toFixed(2) ||
                "0.00"}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-600">BALANCE:</span>
            <span className="text-gray-900">
              {bankData[selectedBank]?.balance.toFixed(2) ||
                "0.00"}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">
          Please select a bank account
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {accountType === "AUTO PAY" ? (
          selectedBank ? (
            <table className="w-full text-sm">
              <thead className="bg-teal-500 text-white text-xs uppercase font-semibold">
                <tr>
                  <th className="px-3 py-2">NO.</th>
                  <th className="px-3 py-2">DESCRIPTION</th>
                  <th className="px-3 py-2">IN</th>
                  <th className="px-3 py-2">OUT</th>
                  <th className="px-3 py-2">TIME</th>
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">MATCH</th>
                  <th className="px-3 py-2">FEE</th>
                  <th className="px-3 py-2">REMARKS</th>
                  <th className="px-3 py-2">INFO</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn, index) => (
                  <tr key={txn.id} className="bg-white">
                    <td className="px-3 py-2">{index + 1}</td>
                    <td className="px-3 py-2">
                      {txn.description}
                    </td>
                    <td className="px-3 py-2 text-green-600">
                      {txn.in.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-red-600">
                      {txn.out.toFixed(2)}
                    </td>
                    <td className="px-3 py-2">{txn.time}</td>
                    <td className="px-3 py-2">{txn.id}</td>
                    <td className="px-3 py-2">{txn.match}</td>
                    <td className="px-3 py-2">
                      {txn.fee.toFixed(2)}
                    </td>
                    <td className="px-3 py-2">{txn.remarks}</td>
                    <td className="px-3 py-2">{txn.info}</td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="text-center py-6 text-gray-500"
                    >
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">
              Please select a bank account
            </div>
          )
        ) : selectedBank ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b text-xs uppercase font-semibold text-gray-700">
              <tr>
                <th className="px-3 py-2">No.</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">In</th>
                <th className="px-3 py-2">Out</th>
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Match</th>
                <th className="px-3 py-2">Fee</th>
                <th className="px-3 py-2">Remarks</th>
                <th className="px-3 py-2">Info</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn, index) => (
                <tr key={txn.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">{index + 1}</td>
                  <td className="px-3 py-2">
                    {txn.description}
                  </td>
                  <td className="px-3 py-2 text-green-600">
                    {txn.in.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-red-600">
                    {txn.out.toFixed(2)}
                  </td>
                  <td className="px-3 py-2">{txn.time}</td>
                  <td className="px-3 py-2">{txn.id}</td>
                  <td className="px-3 py-2">{txn.match}</td>
                  <td className="px-3 py-2">
                    {txn.fee.toFixed(2)}
                  </td>
                  <td className="px-3 py-2">{txn.remarks}</td>
                  <td className="px-3 py-2">{txn.info}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="text-center py-6 text-gray-500"
                  >
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-gray-500">
            Please select a bank account
          </div>
        )}
      </div>
    </div>
  );
}