import React from 'react';
import { Link } from 'react-router-dom';
import { ChartBarIcon, ClipboardDocumentListIcon, BellIcon } from '@heroicons/react/24/outline';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-25 to-white">
      {/* Header của Landing Page */}
      <header className="py-6 px-4 sm:px-6 lg:px-8">
        <nav className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-3xl font-bold text-green-800">
            HealthCare
          </Link>
          <div className="space-x-4">
            <Link
              to="/login"
              className="text-gray-700 hover:text-green-700 font-medium px-4 py-2 rounded-md transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md shadow-md transition-colors"
            >
              Đăng ký
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto text-center py-16 md:py-24 px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-800 mb-6">
          Quản lý <span className="text-green-700">Sức khỏe</span> của bạn,
          <br />
          Một cách <span className="text-green-700">Thông minh</span>.
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          Theo dõi các chỉ số quan trọng, nhận đề xuất cá nhân hóa và đạt được mục tiêu sức khỏe của bạn với HealthApp.
        </p>
        <Link
          to="/register"
          className="bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-xl transition-transform transform hover:scale-105"
        >
          Bắt đầu Ngay
        </Link>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Tính năng Vượt trội
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <ChartBarIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Theo dõi Chỉ số</h3>
              <p className="text-gray-600">
                Dễ dàng ghi lại và theo dõi các chỉ số sức khỏe quan trọng như BMI, cân nặng, mỡ cơ thể, v.v.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="text-center p-6 border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <ClipboardDocumentListIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Thực đơn Cá nhân hóa</h3>
              <p className="text-gray-600">
                Nhận các gợi ý thực đơn hàng ngày phù hợp với mục tiêu và tình trạng sức khỏe của bạn.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="text-center p-6 border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <BellIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Nhắc nhở & Cảnh báo</h3>
              <p className="text-gray-600">
                Không bao giờ bỏ lỡ lịch đo hoặc nhận cảnh báo sớm về các dấu hiệu sức khỏe cần chú ý.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            Sẵn sàng bắt đầu hành trình sức khỏe?
          </h2>
          <p className="text-green-100 text-lg mb-8 max-w-xl mx-auto">
            Tham gia cùng hàng nghìn người dùng đã tin tưởng HealthApp để quản lý sức khỏe hiệu quả.
          </p>
          <Link
            to="/register"
            className="bg-white text-green-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg shadow-xl transition-colors"
          >
            Đăng ký Miễn phí
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-50">
        <div className="container mx-auto text-center px-4">
          <p className="text-gray-600">
            © {new Date().getFullYear()} HealthApp. Mang sức khỏe đến mọi nhà.
          </p>
          <div className="mt-4 space-x-6">
            <Link to="/privacy" className="text-gray-500 hover:text-green-600 transition-colors">
              Chính sách Bảo mật
            </Link>
            <Link to="/terms" className="text-gray-500 hover:text-green-600 transition-colors">
              Điều khoản Sử dụng
            </Link>
            <Link to="/contact" className="text-gray-500 hover:text-green-600 transition-colors">
              Liên hệ
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;