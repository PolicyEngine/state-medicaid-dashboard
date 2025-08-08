import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronUp, Download, RotateCcw, Info } from 'lucide-react';

// PolicyEngine Colors
const colors = {
  BLACK: "#000000",
  BLUE_95: "#D8E6F3",
  BLUE_98: "#F7FAFD",
  BLUE: "#2C6496",
  BLUE_LIGHT: "#D8E6F3",
  BLUE_PRESSED: "#17354F",
  BLUE_PRIMARY: "#2C6496",
  DARK_BLUE_HOVER: "#1d3e5e",
  DARK_GRAY: "#616161",
  DARK_RED: "#b50d0d",
  DARKEST_BLUE: "#0C1A27",
  GRAY: "#808080",
  GREEN: "#29d40f",
  LIGHT_GRAY: "#F2F2F2",
  MEDIUM_DARK_GRAY: "#D2D2D2",
  MEDIUM_LIGHT_GRAY: "#BDBDBD",
  TEAL_ACCENT: "#39C6C0",
  TEAL_LIGHT: "#F7FDFC",
  TEAL_PRESSED: "#227773",
  WHITE: "#FFFFFF"
};

const stateData = {
  'California': { fundingLoss: 42.3, population: 39.5, medicaidEnrollment: 14.2 },
  'Texas': { fundingLoss: 38.7, population: 29.5, medicaidEnrollment: 5.8 },
  'New York': { fundingLoss: 35.2, population: 19.5, medicaidEnrollment: 7.3 },
  'Florida': { fundingLoss: 31.5, population: 21.8, medicaidEnrollment: 5.2 },
  'Pennsylvania': { fundingLoss: 28.9, population: 12.8, medicaidEnrollment: 3.4 },
  'Ohio': { fundingLoss: 24.6, population: 11.7, medicaidEnrollment: 3.1 },
  'Illinois': { fundingLoss: 22.1, population: 12.6, medicaidEnrollment: 3.2 },
  'Michigan': { fundingLoss: 19.8, population: 10.0, medicaidEnrollment: 2.8 },
  'North Carolina': { fundingLoss: 17.3, population: 10.6, medicaidEnrollment: 2.4 },
  'Georgia': { fundingLoss: 15.9, population: 10.7, medicaidEnrollment: 2.0 }
};

const MedicaidReformDashboard = () => {
  const [selectedState, setSelectedState] = useState('California');
  const [eligibilityThresholds, setEligibilityThresholds] = useState({
    children: 138,
    parents: 138,
    adults: 138,
    elderly: 138,
    disabled: 138
  });
  const [workRequirements, setWorkRequirements] = useState(false);
  const [workHours, setWorkHours] = useState(20);
  const [workExemptions, setWorkExemptions] = useState({
    pregnant: true,
    disabled: true,
    caregivers: true,
    students: false
  });
  const [snapCostSharing, setSnapCostSharing] = useState(false);
  const [snapSharePercent, setSnapSharePercent] = useState(0);
  const [incomeTaxIncrease, setIncomeTaxIncrease] = useState(0);
  const [propertyTaxIncrease, setPropertyTaxIncrease] = useState(0);
  const [sinTaxIncrease, setSinTaxIncrease] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    eligibility: true,
    work: true,
    snap: true,
    revenue: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const resetToBaseline = () => {
    setEligibilityThresholds({
      children: 138,
      parents: 138,
      adults: 138,
      elderly: 138,
      disabled: 138
    });
    setWorkRequirements(false);
    setWorkHours(20);
    setWorkExemptions({ pregnant: true, disabled: true, caregivers: true, students: false });
    setSnapCostSharing(false);
    setSnapSharePercent(0);
    setIncomeTaxIncrease(0);
    setPropertyTaxIncrease(0);
    setSinTaxIncrease(0);
  };

  // Calculations
  const stateInfo = stateData[selectedState];
  const baseFundingLoss = stateInfo.fundingLoss;
  
  // Eligibility impact - calculate weighted average reduction
  const groupWeights = { children: 0.4, parents: 0.15, adults: 0.25, elderly: 0.1, disabled: 0.1 };
  const baseThresholds = { children: 138, parents: 138, adults: 138, elderly: 138, disabled: 138 };
  
  let totalEligibilityReduction = 0;
  Object.keys(eligibilityThresholds).forEach(group => {
    const reduction = Math.max(0, (baseThresholds[group] - eligibilityThresholds[group]) / baseThresholds[group]);
    totalEligibilityReduction += reduction * groupWeights[group];
  });
  
  const enrollmentReduction = totalEligibilityReduction * 0.8; // Increased from 0.5 to 0.8
  const eligibilitySavings = baseFundingLoss * enrollmentReduction * 0.85; // Increased from 0.7 to 0.85
  
  // Work requirements impact
  const workReqReduction = workRequirements ? 0.15 : 0; // Increased from 0.08 to 0.15
  const workReqAdminCost = workRequirements ? 0.3 : 0; // Reduced from 0.5 to 0.3
  const workReqSavings = workRequirements ? (baseFundingLoss * workReqReduction * 0.85 - workReqAdminCost) : 0;
  
  // SNAP cost sharing - this ADDS to deficit as state takes on SNAP costs
  const snapCosts = snapCostSharing ? (baseFundingLoss * 0.25 * (snapSharePercent / 100)) : 0; // Additional cost to state
  
  // Revenue calculations (in billions) - Increased multipliers
  const incomeRevenue = incomeTaxIncrease * stateInfo.population * 0.05; // Increased from 0.03
  const propertyRevenue = propertyTaxIncrease * stateInfo.population * 0.04; // Increased from 0.025
  const sinRevenue = sinTaxIncrease * stateInfo.population * 0.002; // Increased from 0.001
  
  const totalRevenue = incomeRevenue + propertyRevenue + sinRevenue;
  const totalSavings = eligibilitySavings + workReqSavings;
  const netBudgetImpact = -baseFundingLoss + totalSavings + totalRevenue - snapCosts; // Subtract SNAP costs
  
  // People affected calculations
  const eligibilityAffected = stateInfo.medicaidEnrollment * enrollmentReduction * 1000000;
  const workReqAffected = stateInfo.medicaidEnrollment * workReqReduction * 1000000;
  const totalAffected = eligibilityAffected + workReqAffected;
  
  // Pie chart data - only include SNAP if it's toggled
  const fundingData = [
    { name: 'Federal Loss', value: Math.max(0, baseFundingLoss - totalSavings) },
    { name: 'State Revenue', value: totalRevenue },
    { name: 'Program Savings', value: totalSavings },
    ...(snapCostSharing && snapCosts > 0 ? [{ name: 'SNAP Costs', value: snapCosts }] : [])
  ].filter(item => item.value > 0); // Only show items with positive values
  
  // Bar chart data
  const enrollmentData = [
    { name: 'Current', enrollment: stateInfo.medicaidEnrollment },
    { name: 'Projected', enrollment: stateInfo.medicaidEnrollment * (1 - enrollmentReduction - workReqReduction) }
  ];
  
  // Line chart data (5-year projection)
  const projectionData = Array.from({ length: 6 }, (_, i) => ({
    year: 2026 + i,
    deficit: -baseFundingLoss + (totalSavings + totalRevenue) * (1 + i * 0.02) - snapCosts * (1 + i * 0.02) // 2% annual growth
  }));

  const COLORS = [colors.DARK_RED, colors.BLUE_PRIMARY, colors.GREEN, colors.GRAY];

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: colors.BLUE_98 }}>
      {/* Demo Watermark */}
      <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg opacity-90">
        <div className="text-lg font-bold">DEMO ONLY</div>
        <div className="text-sm">Not real data</div>
      </div>
      
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6" style={{ color: colors.DARKEST_BLUE }}>Medicaid Reform Modeling Dashboard</h1>
        
        {/* State Selection */}
        <div className="rounded-lg shadow-md p-6 mb-6" style={{ backgroundColor: colors.WHITE }}>
          <label className="block text-lg font-semibold mb-2" style={{ color: colors.DARKEST_BLUE }}>Select State</label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border rounded-md focus:ring-2"
            style={{ 
              borderColor: colors.MEDIUM_DARK_GRAY,
              focusBorderColor: colors.BLUE_PRIMARY
            }}
          >
            {Object.keys(stateData).map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          <div className="mt-4 text-lg">
            <span className="font-semibold">Projected Federal Funding Loss (2026):</span>
            <span className="ml-2 font-bold" style={{ color: colors.DARK_RED }}>${baseFundingLoss}B</span>
          </div>
        </div>

        {/* Budget Impact Summary */}
        <div className="rounded-lg shadow-md p-6 mb-6" style={{ backgroundColor: colors.WHITE }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: colors.DARKEST_BLUE }}>Budget Impact Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: colors.LIGHT_GRAY }}>
              <div className="text-sm" style={{ color: colors.DARK_GRAY }}>Net Budget Impact</div>
              <div className="text-2xl font-bold" style={{ color: netBudgetImpact >= 0 ? colors.GREEN : colors.DARK_RED }}>
                ${netBudgetImpact.toFixed(1)}B
              </div>
            </div>
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: colors.LIGHT_GRAY }}>
              <div className="text-sm" style={{ color: colors.DARK_GRAY }}>People Affected</div>
              <div className="text-2xl font-bold" style={{ color: colors.DARKEST_BLUE }}>
                {(totalAffected / 1000000).toFixed(1)}M
              </div>
            </div>
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: colors.LIGHT_GRAY }}>
              <div className="text-sm" style={{ color: colors.DARK_GRAY }}>Coverage Reduction</div>
              <div className="text-2xl font-bold" style={{ color: colors.DARKEST_BLUE }}>
                {((enrollmentReduction + workReqReduction) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Policy Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Eligibility Adjustments */}
          <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: colors.WHITE }}>
            <div 
              className="flex justify-between items-center cursor-pointer mb-4"
              onClick={() => toggleSection('eligibility')}
            >
              <h3 className="text-lg font-bold" style={{ color: colors.DARKEST_BLUE }}>Eligibility Adjustments by Group</h3>
              {expandedSections.eligibility ? <ChevronUp /> : <ChevronDown />}
            </div>
            {expandedSections.eligibility && (
              <div className="space-y-4">
                {Object.entries(eligibilityThresholds).map(([group, threshold]) => (
                  <div key={group}>
                    <label className="block text-sm font-medium mb-1 capitalize" style={{ color: colors.DARK_GRAY }}>
                      {group}: {threshold}% FPL
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={threshold}
                      onChange={(e) => setEligibilityThresholds({
                        ...eligibilityThresholds,
                        [group]: Number(e.target.value)
                      })}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                      style={{ backgroundColor: colors.BLUE_LIGHT }}
                    />
                  </div>
                ))}
                <div className="pt-3 border-t" style={{ borderColor: colors.MEDIUM_DARK_GRAY }}>
                  <div className="text-sm" style={{ color: colors.DARK_GRAY }}>
                    People affected: {(eligibilityAffected / 1000000).toFixed(2)}M
                  </div>
                  <div className="text-sm" style={{ color: colors.DARK_GRAY }}>
                    Spending impact: ${eligibilitySavings.toFixed(1)}B saved
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Work Requirements */}
          <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: colors.WHITE }}>
            <div 
              className="flex justify-between items-center cursor-pointer mb-4"
              onClick={() => toggleSection('work')}
            >
              <h3 className="text-lg font-bold" style={{ color: colors.DARKEST_BLUE }}>Work Requirements</h3>
              {expandedSections.work ? <ChevronUp /> : <ChevronDown />}
            </div>
            {expandedSections.work && (
              <div>
                <label className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    checked={workRequirements}
                    onChange={(e) => setWorkRequirements(e.target.checked)}
                    className="mr-2 h-4 w-4"
                    style={{ accentColor: colors.BLUE_PRIMARY }}
                  />
                  <span className="text-sm font-medium" style={{ color: colors.DARK_GRAY }}>Implement work requirements</span>
                </label>
                {workRequirements && (
                  <>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.DARK_GRAY }}>
                      Hours per week: {workHours}
                    </label>
                    <select
                      value={workHours}
                      onChange={(e) => setWorkHours(Number(e.target.value))}
                      className="w-full px-3 py-1 border rounded-md mb-3"
                      style={{ borderColor: colors.MEDIUM_DARK_GRAY }}
                    >
                      <option value={20}>20 hours</option>
                      <option value={30}>30 hours</option>
                      <option value={35}>35 hours</option>
                    </select>
                    <div className="space-y-2">
                      <div className="text-sm font-medium" style={{ color: colors.DARK_GRAY }}>Exemptions:</div>
                      {Object.entries(workExemptions).map(([key, value]) => (
                        <label key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setWorkExemptions({...workExemptions, [key]: e.target.checked})}
                            className="mr-2 h-4 w-4"
                            style={{ accentColor: colors.BLUE_PRIMARY }}
                          />
                          <span className="text-sm capitalize" style={{ color: colors.DARK_GRAY }}>{key}</span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-3 text-sm" style={{ color: colors.DARK_GRAY }}>
                      Admin cost: ${workReqAdminCost}B
                    </div>
                    <div className="text-sm" style={{ color: colors.DARK_GRAY }}>
                      Net savings: ${workReqSavings.toFixed(1)}B
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* SNAP Cost Sharing */}
          <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: colors.WHITE }}>
            <div 
              className="flex justify-between items-center cursor-pointer mb-4"
              onClick={() => toggleSection('snap')}
            >
              <h3 className="text-lg font-bold" style={{ color: colors.DARKEST_BLUE }}>Include Budget Impact of SNAP Cost Sharing</h3>
              {expandedSections.snap ? <ChevronUp /> : <ChevronDown />}
            </div>
            {expandedSections.snap && (
              <div>
                <label className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    checked={snapCostSharing}
                    onChange={(e) => setSnapCostSharing(e.target.checked)}
                    className="mr-2 h-4 w-4"
                    style={{ accentColor: colors.BLUE_PRIMARY }}
                  />
                  <span className="text-sm font-medium" style={{ color: colors.DARK_GRAY }}>Include Budget Impact of SNAP Cost Sharing</span>
                </label>
                {snapCostSharing && (
                  <>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.DARK_GRAY }}>
                      Cost-sharing percentage: {snapSharePercent}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={snapSharePercent}
                      onChange={(e) => setSnapSharePercent(Number(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                      style={{ backgroundColor: colors.BLUE_LIGHT }}
                    />
                    <div className="mt-2 text-sm" style={{ color: colors.DARK_GRAY }}>
                      Additional cost: ${snapCosts.toFixed(1)}B
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Revenue Options */}
          <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: colors.WHITE }}>
            <div 
              className="flex justify-between items-center cursor-pointer mb-4"
              onClick={() => toggleSection('revenue')}
            >
              <h3 className="text-lg font-bold" style={{ color: colors.DARKEST_BLUE }}>Revenue Options</h3>
              {expandedSections.revenue ? <ChevronUp /> : <ChevronDown />}
            </div>
            {expandedSections.revenue && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.DARK_GRAY }}>
                    Income tax increase: {incomeTaxIncrease.toFixed(1)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={incomeTaxIncrease}
                    onChange={(e) => setIncomeTaxIncrease(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ backgroundColor: colors.TEAL_LIGHT }}
                  />
                  <div className="text-xs" style={{ color: colors.DARK_GRAY }}>Revenue: ${incomeRevenue.toFixed(1)}B</div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.DARK_GRAY }}>
                    Property tax increase: {propertyTaxIncrease.toFixed(1)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={propertyTaxIncrease}
                    onChange={(e) => setPropertyTaxIncrease(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ backgroundColor: colors.TEAL_LIGHT }}
                  />
                  <div className="text-xs" style={{ color: colors.DARK_GRAY }}>Revenue: ${propertyRevenue.toFixed(1)}B</div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.DARK_GRAY }}>
                    Sin tax increase: {sinTaxIncrease}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sinTaxIncrease}
                    onChange={(e) => setSinTaxIncrease(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ backgroundColor: colors.TEAL_LIGHT }}
                  />
                  <div className="text-xs" style={{ color: colors.DARK_GRAY }}>Revenue: ${sinRevenue.toFixed(1)}B</div>
                </div>
                <div className="pt-2 border-t" style={{ borderColor: colors.MEDIUM_DARK_GRAY }}>
                  <div className="text-sm font-semibold" style={{ color: colors.DARKEST_BLUE }}>
                    Total Revenue: ${totalRevenue.toFixed(1)}B
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Funding Sources Pie Chart */}
          <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: colors.WHITE }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: colors.DARKEST_BLUE }}>Funding Gap Coverage</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={fundingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => value > 0 ? `${name}: $${value.toFixed(1)}B` : ''}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                  startAngle={0}
                  minAngle={15}
                >
                  {fundingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Enrollment Comparison Bar Chart */}
          <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: colors.WHITE }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: colors.DARKEST_BLUE }}>Enrollment Impact</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Millions', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="enrollment" fill={colors.BLUE_PRIMARY} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Budget Trajectory Line Chart */}
          <div className="rounded-lg shadow-md p-6 lg:col-span-2" style={{ backgroundColor: colors.WHITE }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: colors.DARKEST_BLUE }}>5-Year Budget Trajectory</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis label={{ value: 'Billions ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="deficit" 
                  stroke={colors.BLUE_PRIMARY}
                  strokeWidth={3}
                  dot={{ fill: colors.BLUE_PRIMARY }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={resetToBaseline}
            className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg transition"
            style={{ 
              backgroundColor: colors.GRAY,
              ':hover': { backgroundColor: colors.DARK_GRAY }
            }}
          >
            <RotateCcw size={20} />
            Reset to Baseline
          </button>
          <button
            onClick={() => alert('Export functionality would be implemented here')}
            className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg transition"
            style={{ 
              backgroundColor: colors.BLUE_PRIMARY,
              ':hover': { backgroundColor: colors.DARK_BLUE_HOVER }
            }}
          >
            <Download size={20} />
            Export Report
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-6 border rounded-lg p-4" style={{ 
          backgroundColor: colors.BLUE_95,
          borderColor: colors.BLUE_PRIMARY
        }}>
          <div className="flex items-start gap-2">
            <Info className="mt-0.5" size={20} style={{ color: colors.BLUE_PRIMARY }} />
            <div className="text-sm" style={{ color: colors.DARKEST_BLUE }}>
              <p className="font-semibold mb-1">How to use this dashboard:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Select your state to see projected federal funding losses</li>
                <li>Adjust policy levers to model different reform scenarios</li>
                <li>Monitor the budget impact in real-time as you make changes</li>
                <li>Review visualizations to understand enrollment and fiscal impacts</li>
                <li>Export your scenario for further analysis or presentation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicaidReformDashboard;