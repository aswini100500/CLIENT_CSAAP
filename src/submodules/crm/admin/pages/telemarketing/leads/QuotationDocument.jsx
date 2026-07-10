import React from "react";
import {
  Document,
  Image,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";

const formatValue = (amount, country) => {
  if (amount === undefined || amount === null || amount === "") return "0.00";
  const num = parseFloat(amount);
  if (isNaN(num)) return "0.00";
  return num.toLocaleString(country?.code === "IN" ? "en-IN" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#334155",
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: "#334155",
    paddingBottom: 15,
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: "column",
  },
  quotationTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 9,
    color: "#64748B",
    marginBottom: 2,
  },
  metaValue: {
    fontWeight: "bold",
    color: "#1E293B",
  },
  companyWidget: {
    alignItems: "flex-end",
    minWidth: 160,
  },
  logo: {
    width: 60,
    height: 35,
    objectFit: "contain",
    marginBottom: 6,
  },
  companyName: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 2,
  },
  companyDetails: {
    fontSize: 8,
    color: "#64748B",
    textAlign: "right",
  },
  detailsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 15,
  },
  detailsCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    padding: 10,
  },
  cardTitleContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 4,
    marginBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1E293B",
  },
  cardSubtitle: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#94A3B8",
    textTransform: "uppercase",
  },
  cardText: {
    fontSize: 8.5,
    color: "#334155",
    marginBottom: 3,
  },
  boldLabel: {
    fontWeight: "bold",
    color: "#1E293B",
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  headerCell: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#475569",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  tableRowLast: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  bodyCell: {
    fontSize: 8.5,
    color: "#334155",
  },
  descCol: { width: "40%" },
  hsnCol: { width: "15%" },
  qtyCol: { width: "10%", textAlign: "right" },
  rateCol: { width: "15%", textAlign: "right" },
  gstCol: { width: "10%", textAlign: "right" },
  totalCol: { width: "10%", textAlign: "right" },

  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
    marginTop: 10,
  },
  termsCard: {
    width: "55%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#FFFFFF",
  },
  termsTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#475569",
    marginBottom: 6,
  },
  termsText: {
    fontSize: 7.5,
    color: "#64748B",
    lineHeight: 1.4,
  },
  summaryCard: {
    width: "40%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#F8FAFC",
  },
  summaryTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1E293B",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 4,
    marginBottom: 6,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 8,
    color: "#64748B",
  },
  summaryVal: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#1E293B",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 6,
    marginTop: 6,
    marginBottom: 8,
  },
  grandTotalLabel: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#1E293B",
  },
  grandTotalVal: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1E293B",
  },
  wordsBox: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 4,
    padding: 5,
    marginTop: 4,
  },
  wordsLabel: {
    fontSize: 6.5,
    fontWeight: "bold",
    color: "#94A3B8",
    textTransform: "uppercase",
    marginBottom: 1,
  },
  wordsVal: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#1E293B",
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 8,
    alignItems: "center",
  },
  footerText: {
    fontSize: 7.5,
    color: "#94A3B8",
  },
});

const QuotationDocument = ({
  quotationNo,
  quotationDate,
  logoUrl,
  headerInfo,
  country,
  fromDetails,
  forDetails,
  vendorEmails,
  vendorPans,
  clientEmails,
  clientPans,
  items,
  subtotal,
  totalGst,
  sgst,
  cgst,
  grandTotal,
  totalInWords,
  terms,
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.quotationTitle}>QUOTATION</Text>
            <Text style={styles.metaText}>
              No: <Text style={styles.metaValue}>{quotationNo}</Text>
            </Text>
            <Text style={styles.metaText}>
              Date: <Text style={styles.metaValue}>{quotationDate}</Text>
            </Text>
          </View>
          <View style={styles.companyWidget}>
            {logoUrl && <Image style={styles.logo} src={logoUrl} />}
            <Text style={styles.companyName}>{headerInfo.companyName}</Text>
            <Text style={styles.companyDetails}>{headerInfo.email}</Text>
            <Text style={styles.companyDetails}>{headerInfo.phone}</Text>
          </View>
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailsCard}>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>Quotation From</Text>
              <Text style={styles.cardSubtitle}>Your Details</Text>
            </View>
            <Text style={[styles.cardText, styles.boldLabel]}>
              {fromDetails.businessName || "N/A"}
            </Text>
            {fromDetails.phone && (
              <Text style={styles.cardText}>
                Phone: {country.phoneCode} {fromDetails.phone}
              </Text>
            )}
            {fromDetails.gstin && (
              <Text style={styles.cardText}>GSTIN: {fromDetails.gstin}</Text>
            )}
            {fromDetails.address && (
              <Text style={styles.cardText}>
                Address: {fromDetails.address}
                {fromDetails.city && `, ${fromDetails.city}`}
                {fromDetails.postalCode && ` - ${fromDetails.postalCode}`}
              </Text>
            )}
            {vendorEmails.map((email, idx) => (
              <Text key={`ve-${idx}`} style={styles.cardText}>
                Email: {email}
              </Text>
            ))}
            {vendorPans.map((pan, idx) => (
              <Text key={`vp-${idx}`} style={styles.cardText}>
                PAN: {pan}
              </Text>
            ))}
          </View>

          <View style={styles.detailsCard}>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>Quotation For</Text>
              <Text style={styles.cardSubtitle}>Client's Details</Text>
            </View>
            <Text style={[styles.cardText, styles.boldLabel]}>
              {forDetails.businessName || "N/A"}
            </Text>
            {forDetails.phone && (
              <Text style={styles.cardText}>
                Phone: {country.phoneCode} {forDetails.phone}
              </Text>
            )}
            {forDetails.gstin && (
              <Text style={styles.cardText}>GSTIN: {forDetails.gstin}</Text>
            )}
            {forDetails.address && (
              <Text style={styles.cardText}>
                Address: {forDetails.address}
                {forDetails.city && `, ${forDetails.city}`}
                {forDetails.postalCode && ` - ${forDetails.postalCode}`}
              </Text>
            )}
            {clientEmails.map((email, idx) => (
              <Text key={`ce-${idx}`} style={styles.cardText}>
                Email: {email}
              </Text>
            ))}
            {clientPans.map((pan, idx) => (
              <Text key={`cp-${idx}`} style={styles.cardText}>
                PAN: {pan}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.descCol]}>
              Item Description
            </Text>
            <Text style={[styles.headerCell, styles.hsnCol]}>HSN/SAC</Text>
            <Text style={[styles.headerCell, styles.qtyCol]}>Qty</Text>
            <Text style={[styles.headerCell, styles.rateCol]}>
              Rate ({country.symbol})
            </Text>
            <Text style={[styles.headerCell, styles.gstCol]}>GST %</Text>
            <Text style={[styles.headerCell, styles.totalCol]}>
              Total ({country.symbol})
            </Text>
          </View>

          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <View
                key={item.id}
                style={isLast ? styles.tableRowLast : styles.tableRow}
              >
                <Text style={[styles.bodyCell, styles.descCol]}>
                  {item.name || "Untitled Item"}
                </Text>
                <Text style={[styles.bodyCell, styles.hsnCol]}>
                  {item.hsn || "-"}
                </Text>
                <Text style={[styles.bodyCell, styles.qtyCol]}>{item.qty}</Text>
                <Text style={[styles.bodyCell, styles.rateCol]}>
                  {formatValue(item.rate, country)}
                </Text>
                <Text style={[styles.bodyCell, styles.gstCol]}>
                  {item.gst}%
                </Text>
                <Text
                  style={[
                    styles.bodyCell,
                    styles.totalCol,
                    { fontWeight: "bold" },
                  ]}
                >
                  {formatValue(item.amount, country)}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.termsCard}>
            <Text style={styles.termsTitle}>Terms & Conditions</Text>
            <Text style={styles.termsText}>
              {terms || "No terms specified."}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Breakdown</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryVal}>
                {country.symbol}
                {formatValue(subtotal, country)}
              </Text>
            </View>

            {country.currency === "INR" && (
              <>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>SGST (9%)</Text>
                  <Text style={styles.summaryVal}>
                    {country.symbol}
                    {formatValue(sgst, country)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>CGST (9%)</Text>
                  <Text style={styles.summaryVal}>
                    {country.symbol}
                    {formatValue(cgst, country)}
                  </Text>
                </View>
              </>
            )}

            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>
                Total ({country.currency})
              </Text>
              <Text style={styles.grandTotalVal}>
                {country.symbol}
                {formatValue(grandTotal, country)}
              </Text>
            </View>

            <View style={styles.wordsBox}>
              <Text style={styles.wordsLabel}>Amount in Words</Text>
              <Text style={styles.wordsVal}>{totalInWords}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This is a computer generated document. Generated via Builder ERP
            Quotation System.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export const downloadQuotationPDF = async (data) => {
  const blob = await pdf(<QuotationDocument {...data} />).toBlob();
  saveAs(
    blob,
    `Quotation_${data.quotationNo || "DOC"}_${new Date().getTime()}.pdf`,
  );
};
