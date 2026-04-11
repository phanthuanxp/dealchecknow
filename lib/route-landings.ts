export type RoutePricingTier = {
  vehicle: string;
  price: string;
  note: string;
};

export type RouteFaqItem = {
  question: string;
  answer: string;
};

export type RouteReviewItem = {
  customer: string;
  route: string;
  content: string;
};

export type RouteLandingData = {
  slug: string;
  keyword: string;
  pageTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  pickupPoints: string[];
  dropoffPoints: string[];
  pricing: RoutePricingTier[];
  faqs: RouteFaqItem[];
  reviews: RouteReviewItem[];
  trustHighlights: string[];
  longFormSections: Array<{
    heading: string;
    body: string;
  }>;
};

function buildLongFormSections(params: {
  keyword: string;
  routeLabel: string;
  pickupHint: string;
  dropoffHint: string;
}) {
  const { keyword, routeLabel, pickupHint, dropoffHint } = params;

  return [
    {
      heading: `Tổng quan dịch vụ ${keyword}`,
      body: `Dịch vụ ${keyword} phù hợp cho cả khách đi công tác, khách du lịch lẫn gia đình cần lịch trình rõ ràng. Điểm mạnh của tuyến ${routeLabel} là tính linh hoạt: bạn có thể đặt xe theo giờ cố định hoặc theo khung giờ mong muốn, đồng thời chủ động thêm điểm dừng nếu cần. Đội điều phối sẽ xác nhận thông tin sớm, kiểm tra lại điểm đón và phương án di chuyển để hạn chế sai lệch thời gian. Khi khách cần đi trong giờ cao điểm hoặc ngày cuối tuần, việc đặt trước luôn giúp tối ưu trải nghiệm tốt hơn. Mục tiêu của chúng tôi không chỉ là đưa đón đúng nơi, mà còn là giúp hành trình êm, an toàn và thoải mái từ lúc bắt đầu đến khi kết thúc chuyến.`,
    },
    {
      heading: "Điểm đón và điểm trả được tối ưu theo thực tế",
      body: `Với tuyến ${routeLabel}, nhu cầu đón trả thường trải rộng từ khách sạn, homestay, nhà riêng, bến xe, ga tàu cho đến các điểm du lịch đông khách. Vì vậy quy trình xác nhận luôn cần cụ thể: vị trí chính xác, mốc nhận diện và thời gian có mặt. Chúng tôi thường khuyến nghị khách gửi trước vị trí qua Zalo để tài xế chủ động tiếp cận dễ hơn, đặc biệt ở khu vực đông phương tiện. Với các điểm ${pickupHint} và ${dropoffHint}, lái xe sẽ căn theo cung đường thuận lợi để tiết kiệm thời gian chờ. Nếu lịch trình có người lớn tuổi hoặc trẻ nhỏ, đội điều phối cũng tư vấn giờ đi hợp lý để hạn chế mệt và tránh áp lực di chuyển trong khung giờ ùn tắc.`,
    },
    {
      heading: "Bảng giá tham khảo và cách báo giá minh bạch",
      body: `Giá tuyến ${routeLabel} nên được hiểu theo hướng tham khảo và xác nhận lại theo nhu cầu thực tế. Ba yếu tố ảnh hưởng trực tiếp là loại xe, thời gian khởi hành và số điểm dừng phát sinh. Chúng tôi luôn báo trước mức giá theo từng dòng xe để bạn dễ so sánh, đồng thời giải thích rõ khi có điều chỉnh do chờ đợi kéo dài hoặc đổi lịch đột xuất. Khách đi nhóm gia đình thường ưu tiên xe rộng và êm, còn khách công tác lại ưu tiên đúng giờ và điểm trả cụ thể. Vì vậy bảng giá ở trang này đóng vai trò định hướng nhanh, còn mức chốt cuối cùng được xác nhận qua hotline hoặc Zalo để đảm bảo không mập mờ khi lên xe.`,
    },
    {
      heading: "Kinh nghiệm đặt xe để luôn có chuyến đúng giờ",
      body: `Một kinh nghiệm quan trọng với tuyến ${routeLabel} là đặt xe trước tối thiểu 30 đến 90 phút, và dài hơn nếu đi vào ngày nghỉ hoặc dịp lễ. Khi đặt, bạn nên gửi đủ bốn thông tin: điểm đón, điểm trả, giờ mong muốn và số điện thoại liên hệ. Nếu có thêm hành lý lớn, xe đẩy em bé hoặc nhu cầu ghế rộng, hãy báo sớm để điều phối chọn xe phù hợp. Thực tế cho thấy khách cung cấp thông tin càng rõ thì thời gian xác nhận càng nhanh và tỷ lệ phát sinh càng thấp. Với khách cần đi nhiều chặng trong ngày, chúng tôi thường tư vấn gom lộ trình theo cụm để tối ưu cung đường, giảm thời gian quay đầu và tiết kiệm chi phí thực tế.`,
    },
    {
      heading: "Phù hợp cho khách du lịch, khách gia đình và khách công tác",
      body: `Tuyến ${routeLabel} có đặc thù phục vụ nhiều nhóm khách với nhu cầu khác nhau. Khách du lịch thường cần linh hoạt điểm dừng để chụp ảnh, ăn uống hoặc mua đặc sản. Khách gia đình lại quan tâm không gian ngồi thoải mái, cách lái êm và thái độ hỗ trợ khi lên xuống xe. Trong khi đó khách công tác ưu tiên tốc độ xác nhận, đúng giờ đón và thời gian di chuyển ổn định. Chúng tôi đào tạo tài xế theo hướng giao tiếp rõ ràng, hỗ trợ đúng nhu cầu và hạn chế tối đa các phát sinh gây khó chịu. Nhờ vậy, cùng một tuyến nhưng vẫn đáp ứng được nhiều bối cảnh sử dụng thực tế mà không cần quy trình quá phức tạp.`,
    },
    {
      heading: "Cam kết vận hành và tiêu chuẩn phục vụ",
      body: `Chất lượng của một tuyến taxi không đến từ lời quảng cáo, mà đến từ việc thực hiện đúng cam kết trong từng chuyến. Với tuyến ${routeLabel}, chúng tôi duy trì ba nguyên tắc vận hành: xác nhận rõ trước chuyến, liên hệ đúng thời điểm trước giờ đón và cập nhật kịp khi có thay đổi. Về phương tiện, xe được vệ sinh định kỳ, kiểm tra cơ bản trước ca và ưu tiên sắp xếp dòng xe phù hợp số người đi thực tế. Về con người, tài xế cần giao tiếp lịch sự, không hối thúc khách và hỗ trợ hành lý trong khả năng. Đây là các tiêu chuẩn nền tảng để khách yên tâm sử dụng dịch vụ thường xuyên, không chỉ một lần.`,
    },
    {
      heading: "Lý do khách hàng quay lại đặt xe cùng tuyến",
      body: `Nhiều khách quay lại với tuyến ${routeLabel} vì họ cảm thấy quá trình đặt xe đơn giản và có thể kiểm soát được. Thay vì phải trao đổi nhiều lần, khách chỉ cần gửi thông tin cơ bản là nhận được xác nhận nhanh. Mặt khác, việc giữ liên lạc xuyên suốt giữa điều phối, tài xế và khách giúp giảm đáng kể tình huống chờ đợi không rõ lý do. Với khách doanh nghiệp hoặc nhóm đi định kỳ, chúng tôi còn có thể lưu thói quen điểm đón để rút ngắn thao tác đặt xe. Trải nghiệm ổn định qua từng chuyến là yếu tố tạo niềm tin dài hạn, đặc biệt với những hành trình cần độ chính xác cao về giờ giấc.`,
    },
    {
      heading: "Gợi ý kết hợp tuyến và các trang liên quan",
      body: `Ngoài tuyến ${routeLabel}, bạn có thể tham khảo thêm các hướng đi đối ứng để chủ động kế hoạch khứ hồi. Việc xem trước nhiều phương án sẽ giúp bạn tối ưu cả thời gian lẫn chi phí, nhất là khi lịch trình thay đổi theo chuyến bay hoặc lịch làm việc. Trong nội dung bên dưới, chúng tôi đã bố trí các liên kết nội bộ đến những trang tuyến quan trọng và trang bảng giá tổng. Đây là cách hữu ích để bạn so sánh nhanh trước khi quyết định đặt xe. Khi đã chọn được lộ trình phù hợp, chỉ cần gọi hotline hoặc nhắn Zalo, đội điều phối sẽ xác nhận ngay và tư vấn loại xe theo số người đi thực tế.`,
    },
    {
      heading: "Hướng dẫn chốt chuyến nhanh qua hotline và Zalo",
      body: `Để chốt chuyến ${routeLabel} trong thời gian ngắn, bạn chỉ cần chuẩn bị các thông tin: địa chỉ đón chi tiết, địa chỉ trả, mốc thời gian mong muốn và số điện thoại nhận cuộc gọi xác nhận. Nếu đang ở điểm đông khách hoặc ngõ nhỏ, hãy gửi thêm vị trí ghim để tài xế dễ tiếp cận hơn. Sau khi nhận thông tin, điều phối sẽ phản hồi phương án xe, mức giá tham khảo và thời gian có mặt dự kiến. Mọi trao đổi đều được thực hiện rõ ràng để bạn yên tâm trước khi lên xe. Trong trường hợp cần đổi giờ hoặc thay điểm trả, bạn có thể báo lại sớm để chúng tôi sắp xếp lại lịch phù hợp mà không gây gián đoạn hành trình.`,
    }
  ];
}

export const ROUTE_LANDINGS: RouteLandingData[] = [
  {
    slug: "taxi-ha-noi-ninh-binh",
    keyword: "taxi hà nội ninh bình",
    pageTitle: "Taxi Hà Nội Ninh Bình - Đặt Xe Riêng Nhanh, Giá Rõ Ràng",
    metaDescription:
      "Dịch vụ taxi hà nội ninh bình đón tận nơi, xe sạch, tài xế kinh nghiệm, hỗ trợ 24/7. Phù hợp khách gia đình, khách du lịch và khách công tác.",
    h1: "Taxi Hà Nội Ninh Bình - Xe Riêng Đón Tận Nơi 24/7",
    intro:
      "Trang chuyên tuyến taxi hà nội ninh bình dành cho khách cần di chuyển nhanh, an toàn và chủ động thời gian theo lịch cá nhân.",
    pickupPoints: ["Quận Hoàn Kiếm", "Quận Cầu Giấy", "Quận Hà Đông", "Bến xe Mỹ Đình", "Ga Hà Nội"],
    dropoffPoints: ["TP Ninh Bình", "Tam Cốc", "Tràng An", "Bái Đính", "Khu vực Hoa Lư"],
    pricing: [
      { vehicle: "Xe 4 chỗ", price: "1.100.000đ/chuyến", note: "Phù hợp 1-3 khách, hành lý gọn" },
      { vehicle: "Xe 7 chỗ", price: "1.300.000đ/chuyến", note: "Phù hợp gia đình 4-6 khách" },
      { vehicle: "Xe 16 chỗ", price: "1.700.000đ/chuyến", note: "Phù hợp nhóm đông và khách đoàn" }
    ],
    faqs: [
      { question: "Đi từ Hà Nội về Ninh Bình mất bao lâu?", answer: "Thời gian trung bình khoảng 1 giờ 45 phút đến 2 giờ 30 phút tùy điểm đón và tình hình giao thông." },
      { question: "Có hỗ trợ đón tại sân bay rồi về Ninh Bình không?", answer: "Có. Nếu bạn xuống sân bay trước rồi vào nội thành, chúng tôi vẫn sắp xếp được lộ trình phù hợp." },
      { question: "Có thể thêm điểm dừng trên đường không?", answer: "Có thể thêm điểm dừng, bạn chỉ cần báo trước để điều phối cập nhật giá và thời gian chính xác." },
      { question: "Tôi đi gia đình có trẻ nhỏ thì nên chọn xe nào?", answer: "Thông thường xe 7 chỗ sẽ thoải mái hơn về không gian ngồi và hành lý." },
      { question: "Làm sao để xác nhận chuyến nhanh nhất?", answer: "Gọi hotline hoặc nhắn Zalo kèm điểm đón, điểm trả, giờ đi để nhận xác nhận trong ít phút." }
    ],
    reviews: [
      { customer: "Anh Vũ", route: "Hà Nội → Tam Cốc", content: "Xe tới đúng giờ, lái an toàn, gia đình đi cùng trẻ nhỏ rất yên tâm." },
      { customer: "Chị Mai", route: "Cầu Giấy → Tràng An", content: "Đặt qua Zalo nhanh, báo giá rõ, không phát sinh khi kết thúc chuyến." },
      { customer: "Anh Nam", route: "Hà Đông → TP Ninh Bình", content: "Đi công tác nhiều lần và chất lượng luôn ổn định, tài xế lịch sự." }
    ],
    trustHighlights: ["Hỗ trợ 24/7 qua hotline và Zalo", "Tài xế am hiểu tuyến Hà Nội - Ninh Bình", "Xác nhận trước chuyến, hạn chế phát sinh"],
    longFormSections: buildLongFormSections({
      keyword: "taxi hà nội ninh bình",
      routeLabel: "Hà Nội ↔ Ninh Bình",
      pickupHint: "nội thành Hà Nội",
      dropoffHint: "khu du lịch và trung tâm Ninh Bình"
    })
  },
  {
    slug: "taxi-noi-bai-ninh-binh",
    keyword: "taxi nội bài ninh bình",
    pageTitle: "Taxi Nội Bài Ninh Bình - Đón Đúng Giờ Bay, Xe Riêng 24/7",
    metaDescription:
      "Taxi nội bài ninh bình hỗ trợ đón trả theo giờ bay, xe sạch, giá minh bạch. Phù hợp khách bay sớm, bay đêm và nhóm có nhiều hành lý.",
    h1: "Taxi Nội Bài Ninh Bình - Chuyên Tuyến Sân Bay 24/7",
    intro:
      "Trang dịch vụ taxi nội bài ninh bình tập trung cho khách cần đón trả sân bay đúng giờ, giảm rủi ro trễ chuyến và tối ưu hành lý.",
    pickupPoints: ["Ga quốc nội T1", "Ga quốc tế T2", "Khu vực nhà ga VIP", "Bãi đỗ xe sân bay", "Khách sạn gần Nội Bài"],
    dropoffPoints: ["TP Ninh Bình", "Tam Cốc", "Tràng An", "Bái Đính", "Resort khu vực Ninh Hải"],
    pricing: [
      { vehicle: "Xe 4 chỗ", price: "1.300.000đ/chuyến", note: "Phù hợp khách cá nhân hoặc cặp đôi" },
      { vehicle: "Xe 7 chỗ", price: "1.500.000đ/chuyến", note: "Phù hợp gia đình có hành lý" },
      { vehicle: "Xe 16 chỗ", price: "1.900.000đ/chuyến", note: "Phù hợp nhóm đông, đoàn tour" }
    ],
    faqs: [
      { question: "Tôi hạ cánh trễ thì có bị hủy xe không?", answer: "Không. Chúng tôi theo dõi tình trạng chuyến bay và điều chỉnh giờ đón theo thực tế." },
      { question: "Điểm gặp tài xế ở Nội Bài ở đâu?", answer: "Điều phối sẽ gửi điểm hẹn cụ thể theo nhà ga và cửa ra phù hợp trước giờ đón." },
      { question: "Có hỗ trợ khách nhiều vali không?", answer: "Có. Bạn nên báo trước số kiện hành lý để chúng tôi sắp xếp xe phù hợp." },
      { question: "Có phục vụ chuyến đêm hoặc sáng sớm không?", answer: "Có, tuyến này vận hành 24/7, kể cả khung giờ đêm muộn và rạng sáng." },
      { question: "Giá đã bao gồm phí sân bay chưa?", answer: "Giá tham khảo chưa bao gồm mọi loại phí phát sinh đặc thù; điều phối sẽ báo rõ trước khi chốt chuyến." }
    ],
    reviews: [
      { customer: "Anh Long", route: "Nội Bài → Tràng An", content: "Tài xế đợi đúng điểm hẹn, hỗ trợ hành lý tốt, đi đêm rất yên tâm." },
      { customer: "Chị Hạnh", route: "Nội Bài → Tam Cốc", content: "Chốt chuyến nhanh qua Zalo, giá rõ ràng và xe sạch đúng như tư vấn." },
      { customer: "Anh Duy", route: "Nội Bài → TP Ninh Bình", content: "Đi công tác thường xuyên, dịch vụ ổn định và đúng giờ." }
    ],
    trustHighlights: ["Theo dõi giờ bay theo thời gian thực", "Hỗ trợ hành lý cho khách bay", "Đón đúng điểm hẹn tại nhà ga"],
    longFormSections: buildLongFormSections({
      keyword: "taxi nội bài ninh bình",
      routeLabel: "Nội Bài ↔ Ninh Bình",
      pickupHint: "khu vực nhà ga sân bay",
      dropoffHint: "trung tâm và khu du lịch Ninh Bình"
    })
  },
  {
    slug: "taxi-ninh-binh-ha-noi",
    keyword: "taxi ninh bình hà nội",
    pageTitle: "Taxi Ninh Bình Hà Nội - Đặt Xe Nhanh, Đưa Đón Linh Hoạt",
    metaDescription:
      "Dịch vụ taxi ninh bình hà nội phục vụ khách công tác, khám bệnh, du lịch. Xe riêng đón tận nơi, xác nhận nhanh, hỗ trợ 24/7.",
    h1: "Taxi Ninh Bình Hà Nội - Đón Trả Linh Hoạt Theo Lịch Của Bạn",
    intro:
      "Trang dịch vụ taxi ninh bình hà nội dành cho khách cần chuyến đi ổn định, chủ động giờ đón và rõ thông tin chi phí trước khi khởi hành.",
    pickupPoints: ["TP Ninh Bình", "Tam Cốc", "Tràng An", "Bái Đính", "Hoa Lư"],
    dropoffPoints: ["Quận Hai Bà Trưng", "Quận Đống Đa", "Quận Ba Đình", "Bến xe Giáp Bát", "Bệnh viện tuyến trung ương"],
    pricing: [
      { vehicle: "Xe 4 chỗ", price: "1.150.000đ/chuyến", note: "Phù hợp đi cá nhân hoặc cặp đôi" },
      { vehicle: "Xe 7 chỗ", price: "1.350.000đ/chuyến", note: "Phù hợp gia đình và khách có thêm hành lý" },
      { vehicle: "Xe 16 chỗ", price: "1.700.000đ/chuyến", note: "Phù hợp khách đoàn, nhóm công tác" }
    ],
    faqs: [
      { question: "Có nhận đón sớm từ Ninh Bình lên Hà Nội không?", answer: "Có, chúng tôi nhận chuyến sáng sớm và hỗ trợ điều phối theo giờ bạn yêu cầu." },
      { question: "Tôi cần đi bệnh viện tại Hà Nội thì có đợi chiều về không?", answer: "Có thể đặt theo chiều hoặc theo ngày để tài xế chờ và đưa về Ninh Bình." },
      { question: "Có xuất hóa đơn VAT không?", answer: "Có hỗ trợ theo nhu cầu. Bạn vui lòng báo trước khi xác nhận chuyến." },
      { question: "Nếu kẹt xe thì có báo khách không?", answer: "Tài xế và điều phối sẽ chủ động cập nhật tình hình giao thông khi có thay đổi lớn." },
      { question: "Tôi có thể thay đổi điểm trả sau khi lên xe không?", answer: "Có thể, nhưng nên báo sớm để điều phối hỗ trợ phương án phù hợp nhất." }
    ],
    reviews: [
      { customer: "Anh Huy", route: "Tam Cốc → Hà Nội", content: "Đi đúng giờ hẹn, đường đi êm và tài xế hỗ trợ rất nhiệt tình." },
      { customer: "Chị Trang", route: "TP Ninh Bình → Ba Đình", content: "Giá rõ từ đầu, dễ trao đổi và không bị phát sinh ngoài thỏa thuận." },
      { customer: "Anh Kiên", route: "Tràng An → Đống Đa", content: "Đặt xe thường xuyên cho công tác, chất lượng ổn định." }
    ],
    trustHighlights: ["Phù hợp khách công tác và khám bệnh", "Xác nhận nhanh theo lịch hẹn cụ thể", "Có hỗ trợ chuyến một chiều và khứ hồi"],
    longFormSections: buildLongFormSections({
      keyword: "taxi ninh bình hà nội",
      routeLabel: "Ninh Bình ↔ Hà Nội",
      pickupHint: "khu trung tâm và điểm du lịch Ninh Bình",
      dropoffHint: "quận nội thành Hà Nội"
    })
  },
  {
    slug: "taxi-ninh-binh-noi-bai",
    keyword: "taxi ninh bình nội bài",
    pageTitle: "Taxi Ninh Bình Nội Bài - Chuyên Tuyến Sân Bay, Đón Chuẩn Giờ",
    metaDescription:
      "Taxi ninh bình nội bài phục vụ 24/7, linh hoạt giờ đón theo lịch bay. Xe riêng đời mới, tài xế thân thiện, báo giá rõ ràng trước chuyến.",
    h1: "Taxi Ninh Bình Nội Bài - Dịch Vụ Sân Bay Chủ Động 24/7",
    intro:
      "Trang dịch vụ taxi ninh bình nội bài hỗ trợ khách cần đi sân bay đúng kế hoạch, có thể xử lý cả chuyến sớm, chuyến đêm và lịch gấp.",
    pickupPoints: ["TP Ninh Bình", "Khu du lịch Tam Cốc", "Tràng An", "Bái Đính", "Khu nghỉ dưỡng Gia Viễn"],
    dropoffPoints: ["Nhà ga T1 Nội Bài", "Nhà ga T2 Nội Bài", "Bãi đỗ sân bay", "Khách sạn quanh sân bay", "Khu vực Sóc Sơn"],
    pricing: [
      { vehicle: "Xe 4 chỗ", price: "1.300.000đ/chuyến", note: "Phù hợp 1-3 khách, lịch trình gọn" },
      { vehicle: "Xe 7 chỗ", price: "1.550.000đ/chuyến", note: "Phù hợp gia đình nhiều hành lý" },
      { vehicle: "Xe 16 chỗ", price: "1.950.000đ/chuyến", note: "Phù hợp đoàn du lịch, khách công ty" }
    ],
    faqs: [
      { question: "Nên đi trước giờ bay bao lâu từ Ninh Bình?", answer: "Thông thường nên đi trước 4-5 giờ tùy hãng bay và thời điểm trong ngày." },
      { question: "Có nhận chuyến lúc 2-3 giờ sáng không?", answer: "Có. Chúng tôi phục vụ liên tục 24/7 cho tuyến sân bay." },
      { question: "Tôi có thể yêu cầu đón nhiều điểm tại Ninh Bình không?", answer: "Có thể, bạn chỉ cần cung cấp danh sách điểm đón để điều phối tối ưu lộ trình." },
      { question: "Có hỗ trợ ghế trẻ em không?", answer: "Bạn nên báo trước để chúng tôi tư vấn phương án xe phù hợp nhất cho gia đình." },
      { question: "Nếu đổi giờ bay sát giờ thì xử lý thế nào?", answer: "Điều phối sẽ hỗ trợ điều chỉnh nếu còn xe trống và thông báo lại ngay để bạn chủ động." }
    ],
    reviews: [
      { customer: "Anh Phúc", route: "Ninh Bình → Nội Bài", content: "Đi chuyến đêm vẫn rất đúng giờ, lái xe thân thiện và hỗ trợ hành lý tốt." },
      { customer: "Chị Ngọc", route: "Tam Cốc → Nội Bài", content: "Đặt qua hotline nhanh, lộ trình rõ ràng và xe sạch sẽ." },
      { customer: "Anh Sơn", route: "Tràng An → Nội Bài", content: "Đã đi nhiều lần, dịch vụ ổn định và dễ phối hợp đổi lịch." }
    ],
    trustHighlights: ["Chuyên tuyến sân bay Nội Bài", "Đội xe linh hoạt cho lịch bay sớm/đêm", "Hỗ trợ khách nhiều hành lý và khách đoàn"],
    longFormSections: buildLongFormSections({
      keyword: "taxi ninh bình nội bài",
      routeLabel: "Ninh Bình ↔ Nội Bài",
      pickupHint: "điểm đón tại Ninh Bình",
      dropoffHint: "các nhà ga sân bay Nội Bài"
    })
  }
];

export function getRouteLandingData(slug: string) {
  return ROUTE_LANDINGS.find((item) => item.slug === slug) ?? null;
}

