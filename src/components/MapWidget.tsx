import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Navigation, MapPin, CheckCircle, RefreshCw, Milestone } from "lucide-react";

interface MapWidgetProps {
  pickupAddress: string;
  deliveryAddress?: string;
  status: "Pending" | "Accepted" | "Picked Up" | "Delivered" | "Completed";
  onTaskCompleted?: () => void;
}

export default function MapWidget({
  pickupAddress,
  deliveryAddress = "Feeding Hearts NGO, Hub Road",
  status,
  onTaskCompleted
}: MapWidgetProps) {
  const [progress, setProgress] = useState(0);
  const [etaMinutes, setEtaMinutes] = useState(15);
  const [distanceKm, setDistanceKm] = useState(4.2);

  useEffect(() => {
    // Update route simulation progress based on delivery states
    if (status === "Pending" || status === "Accepted") {
      setProgress(0);
      setDistanceKm(4.2);
      setEtaMinutes(15);
    } else if (status === "Picked Up") {
      setProgress(40);
      setDistanceKm(2.5);
      setEtaMinutes(8);
      
      // Simulate progress to delivery over time
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 5;
        });
        setDistanceKm((prev) => Math.max(0.3, Number((prev - 0.2).toFixed(1))));
        setEtaMinutes((prev) => Math.max(1, prev - 1));
      }, 5000);

      return () => clearInterval(interval);
    } else {
      setProgress(100);
      setDistanceKm(0);
      setEtaMinutes(0);
    }
  }, [status]);

  // Coordinates along a curved cubic spline vector
  const getCoordinatesAlongPath = (percent: number) => {
    // Standard cubic bezier calculation for rendering volunteer position
    const t = percent / 100;
    const x0 = 60, y0 = 150; // Pickup (Green Garden Bistro)
    const x1 = 180, y1 = 40;  // Control point 1
    const x2 = 280, y2 = 240; // Control point 2
    const x3 = 390, y3 = 110; // Drop-off NGO
    
    const x = Math.pow(1 - t, 3) * x0 + 
              3 * Math.pow(1 - t, 2) * t * x1 + 
              3 * (1 - t) * Math.pow(t, 2) * x2 + 
              Math.pow(t, 3) * x3;
              
    const y = Math.pow(1 - t, 3) * y0 + 
              3 * Math.pow(1 - t, 2) * t * y1 + 
              3 * (1 - t) * Math.pow(t, 2) * x2 + 
              Math.pow(t, 3) * y3;
              
    return { x, y };
  };

  const volunteerPos = getCoordinatesAlongPath(progress);

  return (
    <div id="map_container" className="bg-white rounded-3xl p-5 border border-lime-100 shadow-sm relative overflow-hidden">
      <div className="flex md:flex-row flex-col justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <span className="bg-lime-50 text-lime-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-max">
            <Navigation className="w-3.5 h-3.5 animate-bounce" /> Live Delivery Map Route
          </span>
          <h4 className="text-sm font-medium text-slate-500 mt-1">Route matching Lower Parel region</h4>
        </div>

        {status === "Picked Up" && (
          <div className="flex items-center gap-4 bg-lime-50/50 p-2.5 rounded-2xl border border-lime-100/50">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase font-mono">Distance Left</p>
              <p className="text-sm font-semibold font-mono text-lime-700">{distanceKm} KM</p>
            </div>
            <div className="h-8 w-[1px] bg-lime-200"></div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-mono">ETA ARRIVAL</p>
              <p className="text-sm font-semibold font-mono text-lime-700">~{etaMinutes} mins</p>
            </div>
          </div>
        )}
      </div>

      {/* SVG Canvas Map */}
      <div className="relative w-full aspect-[450/260] bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden shadow-inner">
        {/* Animated Grid lines for aesthetic depth */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:16px_16px] opacity-60"></div>
        
        {/* River outline for map realism */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* River flow */}
          <path d="M-10,210 Q140,240 220,120 T500,80" fill="none" stroke="#dbeafe" strokeWidth="24" strokeLinecap="round" />
          <path d="M-10,210 Q140,240 220,120 T500,80" fill="none" stroke="#e0f2fe" strokeWidth="12" strokeLinecap="round" />

          {/* Landmarks / Roads */}
          <path d="M 0,90 H 450" fill="none" stroke="#f1f5f9" strokeWidth="8" />
          <path d="M 120,0 V 260" fill="none" stroke="#f1f5f9" strokeWidth="8" />
          <path d="M 330,0 V 260" fill="none" stroke="#f1f5f9" strokeWidth="8" />

          {/* Connected route path dotted */}
          <path
            id="delivery_route_path"
            d="M 60,150 C 180,40 280,240 390,110"
            fill="none"
            stroke="#10b981"
            strokeWidth="3.5"
            strokeDasharray="8 6"
            className="opacity-75"
          />

          {/* Completed route colored overlay */}
          {progress > 0 && (
            <path
              d={`M 60,150 C 180,40 280,240 390,110`}
              fill="none"
              stroke="#047857"
              strokeWidth="4"
              strokeDasharray="8 6"
              strokeDashoffset={400 - (progress * 4)}
              className="transition-all duration-300"
            />
          )}

          {/* Pickup Point - Green Pin */}
          <g transform="translate(60, 150)">
            <circle r="18" fill="#10b981" fillOpacity="0.25" className="animate-ping" style={{ animationDuration: '3s' }} />
            <circle r="8" fill="#10b981" />
            <circle r="4" fill="#ffffff" />
          </g>

          {/* Drop-off NGO - Emerald Flag Pin */}
          <g transform="translate(390, 110)">
            <circle r="22" fill="#047857" fillOpacity="0.15" />
            <circle r="9" fill="#047857" />
            <polygon points="-3,-7 4,-4 -3,-1" fill="#ffffff" />
          </g>

          {/* Animated Driver Avatar tracking coordinates */}
          {status !== "Pending" && status !== "Accepted" && (
            <g transform={`translate(${volunteerPos.x}, ${volunteerPos.y - 12})`}>
              <motion.circle
                r="12"
                fill="#3b82f6"
                stroke="#ffffff"
                strokeWidth="2.5"
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.95, 1.1, 0.95] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
              {/* Scooter glyph outline */}
              <text x="-4" y="3.5" className="text-[10px]" fill="#ffffff">🛵</text>
            </g>
          )}
        </svg>

        {/* Floating annotations */}
        <div className="absolute left-6 top-[165px] bg-white px-3 py-1.5 rounded-xl shadow-md border border-slate-100 flex flex-col pointer-events-none max-w-[120px]">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600 font-display">Donor Pickup</span>
          <span className="text-[11px] font-medium text-slate-800 truncate">{pickupAddress || "Lower Parel"}</span>
        </div>

        <div className="absolute right-6 top-[125px] bg-white px-3 py-1.5 rounded-xl shadow-md border border-slate-100 flex flex-col pointer-events-none max-w-[150px]">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700 font-display">NGO Center</span>
          <span className="text-[11px] font-medium text-slate-800 truncate">{deliveryAddress}</span>
        </div>

        {/* Inline HUD instructions */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 shadow-lg w-[85%] md:w-auto">
          <Milestone className="w-3.5 h-3.5 text-lime-400 rotate-45" />
          <span className="truncate">
            {status === "Pending" && "Awaiting NGO Acceptance to unlock transit"}
            {status === "Accepted" && "Route created. Awaiting Volunteer allocation"}
            {status === "Picked Up" && `Volunteer on-route to delivery point: ~${distanceKm} KM Remaining`}
            {status === "Delivered" && "Arrived! Ready for NGO inspection & completion"}
            {status === "Completed" && "All steps completed successfully. Meals distributed!"}
          </span>
        </div>
      </div>

      {/* Manual progression controls for volunteers to advance states easily */}
      {onTaskCompleted && (status === "Accepted" || status === "Picked Up" || status === "Delivered") && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
            <p className="text-xs text-blue-800">
              {status === "Accepted" && "Are you at the donor restaurant now?"}
              {status === "Picked Up" && "Have you loaded the meals securely and arrived at the NGO?"}
              {status === "Delivered" && "Has the NGO verified food safety and declared completed?"}
            </p>
          </div>
          <button
            onClick={onTaskCompleted}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            {status === "Accepted" && "Mark Loaded & Depart"}
            {status === "Picked Up" && "Mark Arrived & Handover"}
            {status === "Delivered" && "Finalize Task & Award Points"}
          </button>
        </div>
      )}
    </div>
  );
}
