"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DateRangePickerProps {
  fromDate: string
  toDate: string
  onFromDateChange: (date: string) => void
  onToDateChange: (date: string) => void
  onClear: () => void
  onClose?: () => void // <-- add this
}

export function DateRangePicker({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onClear,
  onClose,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(true); // default open
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectingType, setSelectingType] = useState<"from" | "to">("from")
  const [mounted, setMounted] = useState(false)

  // Fix SSR hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Close popover when both dates are set
  // useEffect(() => {
  //   if (fromDate && toDate) {
  //     setIsOpen(false);
  //   }
  // }, [fromDate, toDate]);

  // Call onClose when popover closes
  // useEffect(() => {
  //   if (!isOpen && onClose) onClose();
  // }, [isOpen, onClose]);

  const formatDisplayDate = (dateString: string) => {
    if (!dateString || !mounted) return null
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return null

      const day = date.getDate()
      const month = date.toLocaleDateString("en-US", { month: "short" })
      const year = date.getFullYear().toString().slice(-2)
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" })
      return { day, month, year, dayName, full: `${day} ${month}'${year}` }
    } catch (error) {
      console.error("Error formatting date:", error)
      return null
    }
  }

  const fromDateFormatted = formatDisplayDate(fromDate)
  const toDateFormatted = formatDisplayDate(toDate)

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getNextMonth = (date: Date) => {
    const nextMonth = new Date(date)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    return nextMonth
  }

  const handleDateClick = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]

    if (selectingType === "from") {
      onFromDateChange(dateString)
      setSelectingType("to")
    } else {
      onToDateChange(dateString)
      setIsOpen(false)
      setSelectingType("from")
    }
  }

  const isDateSelected = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return dateString === fromDate || dateString === toDate
  }

  const isDateInRange = (date: Date) => {
    if (!fromDate || !toDate) return false
    const dateString = date.toISOString().split("T")[0]
    return dateString > fromDate && dateString < toDate
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() + (direction === "next" ? 1 : -1))
    setCurrentMonth(newMonth)
  }

  if (!mounted) {
    return (
      <div className="flex gap-2">
        <div className="flex-1 h-16 bg-gray-100 rounded-xl animate-pulse" />
        <div className="flex-1 h-16 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  const currentMonthDays = getDaysInMonth(currentMonth)
  const nextMonth = getNextMonth(currentMonth)
  const nextMonthDays = getDaysInMonth(nextMonth)

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  // Format for compact display
  const compactLabel = fromDate && toDate
    ? `${fromDate} ~ ${toDate}`
    : fromDate
      ? `${fromDate} ~`
      : toDate
        ? `~ ${toDate}`
        : "Select date range";

  return (
    // <Popover open={isOpen} onOpenChange={setIsOpen}>
    //   <PopoverTrigger asChild>
    //     <Button
    //       variant="outline"
    //       size="sm"
    //       className="flex items-center gap-2 px-3 py-1 rounded-full text-xs h-8"
    //     >
    //       <Calendar className="h-4 w-4 text-blue-500" />
    //       <span className={fromDate || toDate ? "text-black" : "text-black"}>
    //         {compactLabel}
    //       </span>
    //       {(fromDate || toDate) && (
    //         <X
    //           className="h-3 w-3 ml-1 text-gray-400 hover:text-red-500 cursor-pointer"
    //           onClick={e => {
    //             e.stopPropagation();
    //             onClear();
    //           }}
    //         />
    //       )}
    //     </Button>
    //   </PopoverTrigger>

    //   <PopoverContent className="w-auto p-0" align="start">
    //     <div className="p-4">
    //       <div className="flex items-center justify-between mb-4">
    //         <div className="text-sm font-medium">
    //           {selectingType === "from" ? "Select From Date" : "Select To Date"}
    //         </div>
    //         <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-6 w-6">
    //           <X className="h-4 w-4" />
    //         </Button>
    //       </div>

    //       <div className="flex gap-4">
    //         {/* Current Month */}
    //         <div className="space-y-2">
    //           <div className="flex items-center justify-between">
    //             <Button variant="ghost" size="icon" onClick={() => navigateMonth("prev")} className="h-6 w-6">
    //               <ChevronLeft className="h-4 w-4" />
    //             </Button>
    //             <div className="font-semibold text-sm">
    //               {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
    //             </div>
    //             <div className="w-6" />
    //           </div>

    //           <div className="grid grid-cols-7 gap-1 text-center">
    //             {weekDays.map((day) => (
    //               <div key={day} className="text-xs font-medium text-gray-500 p-2">
    //                 {day}
    //               </div>
    //             ))}
    //             {currentMonthDays.map((date, index) => (
    //               <div key={index} className="p-1">
    //                 {date ? (
    //                   <Button
    //                     variant="ghost"
    //                     size="sm"
    //                     onClick={() => handleDateClick(date)}
    //                     className={cn(
    //                       "h-8 w-8 p-0 font-normal rounded-full",
    //                       isDateSelected(date) && "bg-blue-500 text-white hover:bg-blue-600",
    //                       isDateInRange(date) && "bg-blue-100 text-blue-900",
    //                       date.toDateString() === new Date().toDateString() && "border border-blue-500",
    //                     )}
    //                   >
    //                     {date.getDate()}
    //                   </Button>
    //                 ) : (
    //                   <div className="h-8 w-8" />
    //                 )}
    //               </div>
    //             ))}
    //           </div>
    //         </div>

    //         {/* Next Month */}
    //         <div className="space-y-2">
    //           <div className="flex items-center justify-between">
    //             <div className="w-6" />
    //             <div className="font-semibold text-sm">
    //               {nextMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
    //             </div>
    //             <Button variant="ghost" size="icon" onClick={() => navigateMonth("next")} className="h-6 w-6">
    //               <ChevronRight className="h-4 w-4" />
    //             </Button>
    //           </div>

    //           <div className="grid grid-cols-7 gap-1 text-center">
    //             {weekDays.map((day) => (
    //               <div key={day} className="text-xs font-medium text-gray-500 p-2">
    //                 {day}
    //               </div>
    //             ))}
    //             {nextMonthDays.map((date, index) => (
    //               <div key={index} className="p-1">
    //                 {date ? (
    //                   <Button
    //                     variant="ghost"
    //                     size="sm"
    //                     onClick={() => handleDateClick(date)}
    //                     className={cn(
    //                       "h-8 w-8 p-0 font-normal rounded-full",
    //                       isDateSelected(date) && "bg-blue-500 text-white hover:bg-blue-600",
    //                       isDateInRange(date) && "bg-blue-100 text-blue-900",
    //                       date.toDateString() === new Date().toDateString() && "border border-blue-500",
    //                     )}
    //                   >
    //                     {date.getDate()}
    //                   </Button>
    //                 ) : (
    //                   <div className="h-8 w-8" />
    //                 )}
    //               </div>
    //             ))}
    //           </div>
    //         </div>
    //       </div>

    //       <div className="flex justify-between items-center mt-4 pt-4 border-t">
    //         <Button variant="outline" size="sm" onClick={onClear} className="text-xs">
    //           Clear Dates
    //         </Button>
    //         <div className="text-xs text-gray-500">
    //           {selectingType === "from" ? "Select from date first" : "Select to date"}
    //         </div>
    //       </div>
    //     </div>
    //   </PopoverContent>
    // </Popover>
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 px-3 py-1 rounded-full text-xs h-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
        >
          <Calendar className="h-4 w-4 text-blue-500" />
          <span className="text-gray-600 dark:text-gray-300 text-sm font-normal">
            {compactLabel}
          </span>
          {(fromDate || toDate) && (
            <X
              className="h-3 w-3 ml-1 text-gray-400 hover:text-red-500 cursor-pointer"
              onClick={e => {
                e.stopPropagation();
                onClear();
              }}
            />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700" align="start">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {selectingType === "from" ? "Select From Date" : "Select To Date"}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-6 w-6">
              <X className="h-4 w-4 text-gray-500 dark:text-gray-300" />
            </Button>
          </div>

          <div className="flex gap-4">
            {/* Current Month */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => navigateMonth("prev")} className="h-6 w-6">
                  <ChevronLeft className="h-4 w-4 text-gray-700 dark:text-gray-200" />
                </Button>
                <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </div>
                <div className="w-6" />
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {weekDays.map((day) => (
                  <div key={day} className="text-xs font-medium text-gray-500 dark:text-gray-400 p-2">
                    {day}
                  </div>
                ))}
                {currentMonthDays.map((date, index) => (
                  <div key={index} className="p-1">
                    {date ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDateClick(date)}
                        className={cn(
                          "h-8 w-8 p-0 font-normal rounded-full",
                          isDateSelected(date) && "bg-blue-500 text-white hover:bg-blue-600",
                          isDateInRange(date) && "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100",
                          date.toDateString() === new Date().toDateString() && "border border-blue-500",
                        )}
                      >
                        {date.getDate()}
                      </Button>
                    ) : (
                      <div className="h-8 w-8" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Next Month */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-6" />
                <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {nextMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </div>
                <Button variant="ghost" size="icon" onClick={() => navigateMonth("next")} className="h-6 w-6">
                  <ChevronRight className="h-4 w-4 text-gray-700 dark:text-gray-200" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {weekDays.map((day) => (
                  <div key={day} className="text-xs font-medium text-gray-500 dark:text-gray-400 p-2">
                    {day}
                  </div>
                ))}
                {nextMonthDays.map((date, index) => (
                  <div key={index} className="p-1">
                    {date ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDateClick(date)}
                        className={cn(
                          "h-8 w-8 p-0 font-normal rounded-full",
                          isDateSelected(date) && "bg-blue-500 text-white hover:bg-blue-600",
                          isDateInRange(date) && "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100",
                          date.toDateString() === new Date().toDateString() && "border border-blue-500",
                        )}
                      >
                        {date.getDate()}
                      </Button>
                    ) : (
                      <div className="h-8 w-8" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" size="sm" onClick={onClear} className="text-xs text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
              Clear Dates
            </Button>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {selectingType === "from" ? "Select from date first" : "Select to date"}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}